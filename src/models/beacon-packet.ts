import { MacHeader } from "./mac-header";
import { RadioTapHeader } from "./radiotap-header";

export class BeaconPacket {
    radioTapHeader: RadioTapHeader;
    macHeader: MacHeader;
    body: BeaconBody;

    constructor(buf: Buffer) {
        this.radioTapHeader = new RadioTapHeader(buf.slice(0));
        this.macHeader = new MacHeader(buf.slice(this.radioTapHeader.length, this.radioTapHeader.length + MacHeader.MAC_HEADER_LENGTH));
        this.body = new BeaconBody(buf.slice(this.radioTapHeader.length + this.macHeader.length));
    }
}

export class BeaconBody {
    // Timestamp (as microseconds) - 8 bytes
    // Time on the access point
    timestamp: bigint;

    // Number of time units between TBTT - 2 bytes
    beaconInterval: number;

    // Requested or advertised optional capabilities - 2 bytes
    capabilityInfo: number;

    // variable
    ssid: string;


    constructor(buf: Buffer) {
        this.timestamp = buf.readBigUInt64LE(0);
        this.beaconInterval = buf.readUInt16LE(8);
        this.capabilityInfo = buf.readUInt16LE(10);

        const ssidElementId = buf.readUInt8(12);
        const ssidLength = buf.readUInt8(13);

        this.ssid = buf.slice(14, 14 + ssidLength).toString('ascii');
    }

    toString() {
        return `Beacon body ==========================
  * Timestamp       : ${this.timestamp} us 
  * Beacon Interval : ${this.beaconInterval}
  * SSID            : ${this.ssid}`;
    }
}