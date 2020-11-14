const UTC_EPOCH = Date.UTC(1970, 0, 1);

export class Timeval {
    tvSec: number; // 4 bytes
    tvUsec: number;

    constructor(buf: Buffer) {
        this.tvSec = buf.readUInt32LE(0);
        this.tvUsec = buf.readUInt32LE(4);
    }

    toString() {
        const d = new Date(UTC_EPOCH);
        d.setSeconds(this.tvSec);
        d.setMilliseconds(this.tvUsec / 1000);
        return d.toLocaleString('en-GB');
    }
}

export class PacketHeader {
    timestamp: any; // Timestamp - 8 bytes;
    caplen: number; // Length of portion present - 4 bytes
    len: number;    // Length of this packet - 4 bytes

    constructor(buf: Buffer) {
        this.timestamp = new Timeval(buf.slice(0, 8));
        this.caplen = buf.readUInt32LE(8);
        this.len = buf.readUInt32LE(12);
    }
}