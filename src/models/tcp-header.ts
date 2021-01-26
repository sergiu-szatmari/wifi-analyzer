export class TcpHeader {
    // Source port - 2 bytes
    srcPort: number;

    // Destination port - 2 bytes
    destPort: number;

    // Sequence number - 4 bytes
    //  - If SYN flag is set => initial seq number
    //  - If SYN not set => accumulated seq number
    sequenceNumber: number;

    // Acknowledgement number - 4 bytes
    ackNumber: number;

    // Data offset - 1 byte
    //  * Size of the TCP header in 32bit words
    //  * [5words, 15words] = [20bytes, 60bytes]
    dataOffset: number;

    // Flags - 9 bits
    flags: number;

    flag: {
        // ECN-Nonce flag
        //  - Concealment protection
        NS?: boolean;

        // Congestion window reduced flag
        CWR?: boolean;

        // ECN-Echo flag
        //  - If SYN flag = 1 ==> TCP peer is ECN capable
        //  - If SUN flag = 0 ==> Network congestion of the TCP sender
        ECE?: boolean;

        // Urgent pointer flag
        URG?: boolean;

        // Acknowledgement flag
        ACK?: boolean;

        // Push function flag
        //  - asks to push the buffered
        //    data to the receiving app
        PSH?: boolean;

        // Reset connection flag
        RST?: boolean;

        // Synchronize sequence numbers flag
        SYN?: boolean;

        // Last packet from sender
        FIN?: boolean;
    } = {};

    // Window size - 2 bytes
    //  - the size of the receive window
    //    (no. of window size units)
    windowSize: number;

    // Checksum - 2 bytes
    checkSum: number;

    // Urgent pointer - 2 bytes
    //  - if URG flag is set, then urgentPointer is
    //    an offset from the seq number indicating last
    //    urgent data byte
    urgentPointer: number;

    // Options if dataOffset > 5
    options?: Buffer;

    constructor(buf: Buffer) {
        this.srcPort        = buf.readUInt16BE(0);
        this.destPort       = buf.readUInt16BE(2);
        this.sequenceNumber = buf.readUInt32BE(4);
        this.ackNumber      = buf.readUInt32BE(8);

        // Byte 12 of the header, containing "Data offset" + "3 reserved bits" + NS flag
        const dataOffsetNS  = buf.readUInt8(12);
        this.dataOffset     = (dataOffsetNS & 0b11110000) >>> 4;
        this.flag.NS        = (dataOffsetNS & 0b00000001) > 0;

        if (buf.byteLength < this.dataOffset * 4) throw new Error('Incomplete TCP Header');


        // Grouping flags into a 9bit number as
        // Flags: NS CWR ECE URG ACK PSH RST SYN FIN
        // Bits:   8   7   6   5   4   3   2   1   0
        const flags         = buf.readUInt8(13);
        this.flags          = ((this.flag.NS ? 1 : 0) << 8) + flags;

        // Flags
        this.flag.CWR       = (this.flags & 0b10000000) > 0;
        this.flag.ECE       = (this.flags & 0b01000000) > 0;
        this.flag.URG       = (this.flags & 0b00100000) > 0;
        this.flag.ACK       = (this.flags & 0b00010000) > 0;
        this.flag.PSH       = (this.flags & 0b00001000) > 0;
        this.flag.RST       = (this.flags & 0b00000100) > 0;
        this.flag.SYN       = (this.flags & 0b00000010) > 0;
        this.flag.FIN       = (this.flags & 0b00000001) > 0;

        this.windowSize     = buf.readUInt16BE(14);
        this.checkSum       = buf.readUInt16BE(16);
        this.urgentPointer  = buf.readUInt16BE(18);

        if (this.dataOffset > 5) this.options = buf.slice(20, this.dataOffset * 4);
    }

    get length(): number { return this.dataOffset * 4; }

    toString() {
        return `---- TCP Header ------------------------------
  * Source port         : ${ this.srcPort }
  * Destination port    : ${ this.destPort }
  * Sequence number     : ${ this.sequenceNumber }
  * ACK number          : ${ this.ackNumber }
  * Data offset         : ${ this.dataOffset }
  * Flags               : ${ this.flags }
        --> NS          : ${ this.flag.NS }
        --> CWR         : ${ this.flag.CWR }
        --> ECE         : ${ this.flag.ECE }
        --> URG         : ${ this.flag.URG }
        --> ACK         : ${ this.flag.ACK }
        --> PSH         : ${ this.flag.PSH }
        --> RST         : ${ this.flag.RST }
        --> SYN         : ${ this.flag.SYN }
        --> FIN         : ${ this.flag.FIN }
  * Window size         : ${ this.windowSize }
  * Checksum            : ${ this.checkSum }
  * Urgent pointer      : ${ this.urgentPointer }
----------------------------------------------------`;
    }
}
