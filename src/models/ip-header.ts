import { IpAddress } from "./address";

export class IPv4Header {
    // Version - 4 bits
    //  * version === 4 ==> IPv4
    version: number;

    // IPv4 Header Length (in 32bit words) - 4 bits
    //  * [5words, 15words] = [20bytes, 60bytes]
    ihl: number;

    // Type of service - 1 byte
    typeOfService: number;

    // Total packet length (in bytes - header & data included) - 2 bytes
    totalLength: number;

    // Identification - 2 byte
    //  * uniquely identifies the
    //    group of fragments of
    //    a single IP datagram
    identification: number;

    // Flags - 3 bits
    //  * used for controlling & identifying fragments
    flags: number;

    flag: {
        // Don't fragment flag
        //  * if flag is set and fragmentation
        //  is required, the packet is dropped
        DF?: boolean;

        // More fragments flag
        //  * for fragmented packets, all fragments
        //    except for the last one have this flag set
        MF?: boolean;
    } = {};

    // Fragment offset - 13 bits
    fragmentOffset: number;

    // Time to leave - 1 byte
    //  * prevents datagrams from
    //    persisting on the internet
    ttl: number;

    // Protocol - 1 byte
    protocol: number;

    // Checksum - 2 bytes
    checkSum: number;

    // Source IP Address - 4 bytes
    srcIp: IpAddress;

    // Destination IP Address - 4 bytes
    destIp: IpAddress;

    // Options if IHL > 5 - 16 bytes
    options?: Buffer;

    constructor(buf: Buffer) {
        const vhl       = buf.readUInt8(0);
        this.version    = vhl >>> 4;   // X X X X _ _ _ _
        this.ihl        = vhl & 0x0f;  // _ _ _ _ X X X X

        if (this.ihl * 4 > buf.byteLength) throw new Error('Incomplete IP Header');
        buf = buf.slice(0, this.ihl * 4);

        this.typeOfService  = buf.readUInt8(1);
        this.totalLength    = buf.readUInt16BE(2);
        this.identification = buf.readUInt16BE(4);

        const flagsFragment = buf.readUInt16BE(6);
        this.flags          = flagsFragment >>> 13; // First 3 bits
        this.flag.DF        = (this.flags & 0b00000010) > 0;
        this.flag.MF        = (this.flags & 0b00000100) > 0;
        this.fragmentOffset = flagsFragment & 0x1fff;

        this.ttl            = buf.readUInt8(8);
        this.protocol       = buf.readUInt8(9);
        this.checkSum       = buf.readUInt16BE(10);

        this.srcIp          = new IpAddress(buf.slice(12, 16));
        this.destIp         = new IpAddress(buf.slice(16, 20));

        if (this.ihl > 5) this.options = buf.slice(20, this.ihl * 4);
    }

    get length(): number { return this.ihl * 4; }

    toString() {
        return `---- IPv4 Header ------------------------------
  * Version             : ${ this.version }
  * IHL                 : ${ this.ihl }
  * TOS                 : ${ this.typeOfService }
  * Total length        : ${ this.totalLength }
  * Identification      : ${ this.identification }
  * Flags               : ${ this.flags }
        --> DF          : ${ this.flag.DF }
        --> MF          : ${ this.flag.MF }
  * Fragment Offset     : ${ this.fragmentOffset }
  * TTL                 : ${ this.ttl }
  * Protocol            : ${ this.protocol }
  * Checksum            : ${ this.checkSum }
  * Source address      : ${ this.srcIp.toString() }
  * Destination address : ${ this.destIp.toString() }
----------------------------------------------------`;
    }

}

export enum IpProtocol {
    HOPOPT          = 0,                BBNRCCMON       = 10,               HMP         = 20,
    ICMP            = 1,                NVPII           = 11,               PRM         = 21,
    IGMP            = 2,                PUP             = 12,               XNSIDP      = 22,
    GGP             = 3,                ARGUS           = 13,               TRUNK1      = 23,
    IpInIp          = 4,                EMCON           = 14,               TRUNK2      = 24,
    ST              = 5,                XNET            = 15,               LEAF1       = 25,
    TCP             = 6,                CHAOS           = 16,               LEAF2       = 26,
    CBT             = 7,                UDP             = 17,               RDP         = 27,
    EGP             = 8,                MUX             = 18,               IRTP        = 28,
    IGP             = 9,                DCNMEAS         = 19,               ISOTP4      = 29,

    NETBLT          = 30,               IL              = 40,               ESP         = 50,
    MFENSP          = 31,               IPv6            = 41,               AH          = 51,
    MERITINP        = 32,               SDRP            = 42,               INLSP       = 52,
    DCCP            = 33,               IPv6Route       = 43,               SwIPe       = 53,
    THREEPC         = 34,               IPv6Frag        = 44,               NARP        = 54,
    IDPR            = 35,               IDRP            = 45,               MOBILE      = 55,
    XTP             = 36,               RSVP            = 46,               TLSP        = 56,
    DDP             = 37,               GREs            = 47,               SKIP        = 57,
    IDPRCMTP        = 38,               DSR             = 48,               IPv6ICMP    = 58,
    TPPP            = 39,               BNA             = 49,               IPv6NoNxt   = 59,

    IPv6Opts        = 60,               VISA            = 70,               VMTP        = 81,
    INTERNAL        = 61,               IPCU            = 71,               SECUREVMTP  = 82,
    CFTP            = 62,               CPNX            = 72,               VINES       = 83,
    LocalNetwork    = 63,               CPHB            = 73,               TTP         = 84,
    SATEXPAK        = 64,               WSN             = 74,               IPTM        = 84,
    KRYPTOLAN       = 65,               PVP             = 75,               NSFNETIGP   = 85,
    RVD             = 66,               BRSATMON        = 76,               DGP         = 86,
    IPPC            = 67,               SUNND           = 77,               TCF         = 87,
    DFS             = 68,               WBMON           = 78,               EIGRP       = 88,
    SATMON          = 69,               WBEXPAK         = 79,               OSPF        = 89,

    ISOIP           = 80,               PES             = 99,               CompaqPeer  = 110,
    SpriteRPC       = 90,               GMTP            = 100,              IPXinIP     = 111,
    LARP            = 91,               IFMP            = 101,              VRRP        = 112,
    MTP             = 92,               PNNI            = 102,              PGM         = 113,
    AX25            = 93,               PIM             = 103,              HOP         = 114,
    OS              = 94,               ARIS            = 104,              L2TP        = 115,
    MICP            = 95,               SCPS            = 105,              DDX         = 116,
    SCCSP           = 96,               QNX             = 106,              IATP        = 117,
    ETHERIP         = 97,               AN              = 107,              STP         = 118,
    ENCAP           = 98,               IPComp          = 108,              SRP         = 119,

    SMP             = 121,              FC              = 133,              SNP         = 109,
    SM              = 122,              RSVPE2EIGNORE   = 134,              UTI         = 120,
    PTP             = 123,              MOBILITY        = 135,              PIPE        = 131,
    ISIS            = 124,              UDPLite         = 136,              Ethernet    = 143,
    FIRE            = 125,              MPLSinIP        = 137,              SPS         = 130,
    CRTP            = 126,              manet           = 138,              ROHC        = 142,
    CRUDP           = 127,              HIP             = 139,              SSCOPMCE    = 128,
    Shim6           = 140,              IPLT            = 129,              WESP        = 141,
}
