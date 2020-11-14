export class IPv4Header {
    version: number;        // Version - 4 bits
    ihl: number;            // Internet Header Length (in words) - 4 bits
    typeOfService: number;  // Type of service - 1 byte
    totalLength: number;    // Total packet length (in bytes) - 2 bytes
    identification: number; // Identification - 2 byte
    flags: number;          // Flags - 3 bits
    dfFlag: boolean;        // Don't fragment flag
    mfFlag: boolean;        // More fragments flag
    fragmentOffset: number; // Fragment offset - 13 bits
    ttl: number;            // Time to leave - 1 byte
    protocol: number;       // Protocol - 1 byte
    checkSum: number;       // Checksum - 2 bytes
    srcIp: IpAddress;       // Source IP Address - 4 bytes
    destIp: IpAddress;      // Destination IP Address - 4 bytes
    options?: Buffer;       // Options if IHL > 5 - 16 bytes

    constructor(buf: Buffer) {
        const vhl = buf.readUInt8(0);
        this.version = vhl >>> 4;   // First 4 bits
        this.ihl = vhl & 0x0f;      // Last 4 bits

        if (this.ihl * 4 > buf.byteLength) throw new Error('Incomplete IP Header');
        buf = buf.slice(0, this.ihl * 4);

        this.typeOfService = buf.readUInt8(1);
        this.totalLength = buf.readUInt16BE(2);
        this.identification = buf.readUInt16BE(4);

        const flagsFragment = buf.readUInt16BE(6);
        this.flags = flagsFragment >>> 13; // First 3 bits
        this.dfFlag = (this.flags & 0x02) > 0;
        this.mfFlag = (this.flags & 0x04) > 0;
        this.fragmentOffset = flagsFragment & 0x1fff;

        this.ttl = buf.readUInt8(8);
        this.protocol = buf.readUInt8(9);
        this.checkSum = buf.readUInt16BE(10);

        this.srcIp = new IpAddress(buf.slice(12, 16));
        this.destIp = new IpAddress(buf.slice(16, 20));

        if (this.ihl > 5) this.options = buf.slice(20, this.ihl * 4);
    }

    get length(): number { return this.ihl * 4; }

    toString() {
        return `IPv4 Header ==========================
    * Version             : ${this.version}
    * IHL                 : ${this.ihl}
    * TOS                 : ${this.typeOfService}
    * Total length        : ${this.totalLength}
    * Identification      : ${this.identification}
    * Flags               : ${this.flags}
        * DF              : ${this.dfFlag}
        * MF              : ${this.mfFlag}
    * Fragment Offset     : ${this.fragmentOffset}
    * TTL                 : ${this.ttl}
    * Protocol            : ${this.protocol}
    * Checksum            : ${this.checkSum}
    * Source address      : ${this.srcIp.toString()}
    * Destination address : ${this.destIp.toString()}`;
    }

}

export class IpAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 4; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.join('.'); }
}

export class MacAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 6; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.map(el => el.toString(16)).join(':'); }
}


// https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers
export enum IpProtocol {
    HOPOPT = 0,
    ICMP = 1,
    IGMP = 2,
    GGP = 3,
    IpInIp = 4,
    ST = 5,
    TCP = 6,
    CBT = 7,
    EGP = 8,
    IGP = 9,
    BBNRCCMON = 10,
    NVPII = 11,
    PUP = 12,
    ARGUS = 13,
    EMCON = 14,
    XNET = 15,
    CHAOS = 16,
    UDP = 17,
    MUX = 18,
    DCNMEAS = 19,
    HMP = 20,
    PRM = 21,
    XNSIDP = 22,
    TRUNK1 = 23,
    TRUNK2 = 24,
    LEAF1 = 25,
    LEAF2 = 26,
    RDP = 27,
    IRTP = 28,
    ISOTP4 = 29,
    NETBLT = 30,
    MFENSP = 31,
    MERITINP = 32,
    DCCP = 33,
    THREEPC = 34,
    IDPR = 35,
    XTP = 36,
    DDP = 37,
    IDPRCMTP = 38,
    TPPP = 39,
    IL = 40,
    IPv6 = 41,
    SDRP = 42,
    IPv6Route = 43,
    IPv6Frag = 44,
    IDRP = 45,
    RSVP = 46,
    GREs = 47,
    DSR = 48,
    BNA = 49,
    ESP = 50,
    AH = 51,
    INLSP = 52,
    SwIPe = 53,
    NARP = 54,
    MOBILE = 55,
    TLSP = 56,
    SKIP = 57,
    IPv6ICMP = 58,
    IPv6NoNxt = 59,
    IPv6Opts = 60,
    INTERNAL = 61,
    CFTP = 62,
    LocalNetwork = 63,
    SATEXPAK = 64,
    KRYPTOLAN = 65,
    RVD = 66,
    IPPC = 67,
    DFS = 68,
    SATMON = 69,
    VISA = 70,
    IPCU = 71,
    CPNX = 72,
    CPHB = 73,
    WSN = 74,
    PVP = 75,
    BRSATMON = 76,
    SUNND = 77,
    WBMON = 78,
    WBEXPAK = 79,
    ISOIP = 80,
    VMTP = 81,
    SECUREVMTP = 82,
    VINES = 83,
    TTP = 84,
    IPTM = 84,
    NSFNETIGP = 85,
    DGP = 86,
    TCF = 87,
    EIGRP = 88,
    OSPF = 89,
    SpriteRPC = 90,
    LARP = 91,
    MTP = 92,
    AX25 = 93,
    OS = 94,
    MICP = 95,
    SCCSP = 96,
    ETHERIP = 97,
    ENCAP = 98,
    PES = 99,
    GMTP = 100,
    IFMP = 101,
    PNNI = 102,
    PIM = 103,
    ARIS = 104,
    SCPS = 105,
    QNX = 106,
    AN = 107,
    IPComp = 108,
    SNP = 109,
    CompaqPeer = 110,
    IPXinIP = 111,
    VRRP = 112,
    PGM = 113,
    HOP = 114,
    L2TP = 115,
    DDX = 116,
    IATP = 117,
    STP = 118,
    SRP = 119,
    UTI = 120,
    SMP = 121,
    SM = 122,
    PTP = 123,
    ISIS = 124,
    FIRE = 125,
    CRTP = 126,
    CRUDP = 127,
    SSCOPMCE = 128,
    IPLT = 129,
    SPS = 130,
    PIPE = 131,
    SCTP = 132,
    FC = 133,
    RSVPE2EIGNORE = 134,
    MOBILITY = 135,
    UDPLite = 136,
    MPLSinIP = 137,
    manet = 138,
    HIP = 139,
    Shim6 = 140,
    WESP = 141,
    ROHC = 142,
    Ethernet = 143,
}