import { MacAddress } from "./address";

export enum EtherType {
    IPv4        = 0x0800,
    IPv6        = 0x86DD,
    ARP         = 0x0806,
    RARP        = 0x8035,
    LOOPBACK    = 0x9000
}

export class EthernetHeader {
    static ETHERNET_HEADER_LENGTH = 14; // 14 bytes

    destMac: MacAddress;    // 6 bytes
    srcMac: MacAddress;     // 6 bytes
    type: EtherType;        // 2 bytes

    constructor(buf: Buffer) {
        this.destMac = new MacAddress(buf.slice(0, 6));
        this.srcMac  = new MacAddress(buf.slice(6, 12));
        this.type    = buf.readUInt16BE(12);
    }

    get length(): number { return EthernetHeader.ETHERNET_HEADER_LENGTH; }

    toString() {
        return `---- Ethernet Header ------------------------------
  * Destination MAC : ${ this.destMac.toString() }
  * Source MAC      : ${ this.srcMac.toString() }
  * EtherType       : ${ EtherType[ this.type ] }
----------------------------------------------------`;
    }
}
