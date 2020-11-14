export class TcpHeader {
    srcPort: number;        // Source port - 2 bytes
    destPort: number;       // Destination port - 2 bytes
    sequenceNumber: number; // Sequence number - 4 bytes
    ackNumber: number;      // Acknowledgement number - 4 bytes
    dataOffset: number;     // Data offset - 1 byte
    flags: number;          // Flags - 9 bits
    flag: {
        NS?: boolean;       // ECN-Nonce flag
        CWR?: boolean;      // Congestion window reduced flag
        ECE?: boolean;      // ECN-Echo flag
        URG?: boolean;      // Urgent pointer flag
        ACK?: boolean;      // Acknowledgement flag
        PSH?: boolean;      // Push function flag
        RST?: boolean;      // Reset connection flag
        SYN?: boolean;      // Synchronize sequence numbers flag
        FIN?: boolean;      // Last packet
    }
    windowSize: number;     // Window size - 2 bytes
    checkSum: number;       // Checksum - 2 bytes
    urgentPointer: number;  // Urgent pointer - 2 bytes
    options?: Buffer;       // Options if dataOffset > 5

    constructor(buf: Buffer) {
        this.flag = {};

        this.srcPort = buf.readUInt16BE(0);
        this.destPort = buf.readUInt16BE(2);
        this.sequenceNumber = buf.readUInt32BE(4);
        this.ackNumber = buf.readUInt32BE(8);

        const dataOffsetNS = buf.readUInt8(12);
        this.dataOffset = (dataOffsetNS & 0xf0) >>> 4;
        this.flag.NS = (dataOffsetNS & 0x01) > 0;

        if (buf.byteLength < this.dataOffset * 4) throw new Error('Incomplete TCP Header');

        const flags = buf.readUInt8(13);
        this.flags = flags + ((this.flag.NS ? 1 : 0) << 8);
        this.flag.CWR = (this.flags & 0b10000000) > 0;
        this.flag.ECE = (this.flags & 0b01000000) > 0;
        this.flag.URG = (this.flags & 0b00100000) > 0;
        this.flag.ACK = (this.flags & 0b00010000) > 0;
        this.flag.PSH = (this.flags & 0b00001000) > 0;
        this.flag.RST = (this.flags & 0b00000100) > 0;
        this.flag.SYN = (this.flags & 0b00000010) > 0;
        this.flag.FIN = (this.flags & 0b00000001) > 0;

        this.windowSize = buf.readUInt16BE(14);
        this.checkSum = buf.readUInt16BE(16);
        this.urgentPointer = buf.readUInt16BE(18);

        if (this.dataOffset > 5) this.options = buf.slice(20, this.dataOffset * 4);
    }

    get length(): number { return this.dataOffset * 4; }

    toString() {
        return `TCP Header ==========================
  * Source port      : ${this.srcPort}
  * Destination port : ${this.destPort}
  * Sequence number  : ${this.sequenceNumber}
  * ACK number       : ${this.ackNumber}
  * Data offset      : ${this.dataOffset}
  * Flags            : ${this.flags}
    - NS             : ${this.flag.NS}
    - CWR            : ${this.flag.CWR}
    - ECE            : ${this.flag.ECE}
    - URG            : ${this.flag.URG}
    - ACK            : ${this.flag.ACK}
    - PSH            : ${this.flag.PSH}
    - RST            : ${this.flag.RST}
    - SYN            : ${this.flag.SYN}
    - FIN            : ${this.flag.FIN}
  * Window size      : ${this.windowSize}
  * Checksum         : ${this.checkSum}
  * Urgent pointer   : ${this.urgentPointer}`;
    }
}