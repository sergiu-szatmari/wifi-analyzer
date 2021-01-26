import { EthernetHeader, EtherType } from "./ethernet-header";
import { IpProtocol, IPv4Header } from "./ip-header";
import { TcpHeader } from "./tcp-header";

export class TcpPacket {
    ethernetHeader: EthernetHeader;
    ipHeader: IPv4Header;
    tcpHeader: TcpHeader;
    payload?: Payload;

    constructor(buf: Buffer) {
        if (buf.byteLength < EthernetHeader.ETHERNET_HEADER_LENGTH) throw new Error('Buffer less than Ethernet header length');
        this.ethernetHeader = new EthernetHeader(buf.slice(0, EthernetHeader.ETHERNET_HEADER_LENGTH));

        if (this.ethernetHeader.type !== EtherType.IPv4) throw new Error(`Protocol not supported: ${ EtherType[ this.ethernetHeader.type ] }`);
        this.ipHeader = new IPv4Header(buf.slice(this.ethernetHeader.length));

        if (this.ipHeader.protocol !== IpProtocol.TCP) throw new Error(`IP Protocol not supported: ${ IpProtocol[ this.ipHeader.protocol ] }`);
        this.tcpHeader = new TcpHeader(buf.slice(this.ethernetHeader.length + this.ipHeader.length));

        const payloadOffset = this.ethernetHeader.length + this.ipHeader.length + this.tcpHeader.length;
        if (buf.byteLength > payloadOffset) this.payload = new Payload(buf.slice(payloadOffset));
    }
}

export class Payload {
    constructor(public data: Buffer) { }

    toString() {
        return `---- Payload ------------------------------
${ this.data.toString().trim() }
----------------------------------------------------`;
    }
}
