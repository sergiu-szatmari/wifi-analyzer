const toHex = (num: number) =>
    num.toString(16)?.length === 1 ? `0${ num.toString(16) }` : num.toString(16);

export class IpAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 4; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.join('.'); }
}

export class MacAddress {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 6; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.map(toHex).join(':'); }
}

export class OUI {
    elems: number[] = [];
    constructor(buf: Buffer) { for (let i = 0; i < 3; i++) this.elems.push(buf.readUInt8(i)); }
    toString() { return this.elems.map(toHex).join(':'); }
}
