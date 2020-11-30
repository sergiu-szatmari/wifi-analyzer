export class IpAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 4; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.join('.'); }
}

export class MacAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 6; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.map((n) => (n.toString(16)?.length === 1 ? `0${n.toString(16)}` : n.toString(16))).join(':'); }
}