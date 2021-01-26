const UTC_EPOCH = Date.UTC(1970, 0, 1);

export class Ts {
    // Date & time when the current packet
    // was captured (seconds since 1 Jan '70)
    // 4 bytes
    tsSec: number;

    // Date & time when the current packet was captured
    // (microseconds as offset from tsSec)
    // 4 bytes
    tsUsec: number;

    constructor(buf: Buffer) {
        this.tsSec = buf.readUInt32LE(0);
        this.tsUsec = buf.readUInt32LE(4);
    }

    toString() {
        const d = new Date(UTC_EPOCH);
        d.setSeconds(this.tsSec);
        d.setMilliseconds(this.tsUsec / 1000);
        return d.toLocaleString('en-GB');
    }
}

export class PacketHeader {
    // Timestamp
    // 8 bytes;
    timestamp: any;

    // Length of captured
    // length - 4 bytes
    caplen: number;

    // Length of this packet
    // as it appeared on the network
    // at capture time - 4 bytes
    len: number;

    constructor(buf: Buffer) {
        this.timestamp = new Ts(buf.slice(0, 8));
        this.caplen = buf.readUInt32LE(8);
        this.len = buf.readUInt32LE(12);
    }
}
