import { MacHeader } from "./mac-header";
import { RadioTapHeader } from "./radiotap-header";
import { OUI } from "./address";
import { toObject, toString } from '../utils/object-utils';

export class BeaconPacket {
    radioTapHeader: RadioTapHeader;
    macHeader: MacHeader;
    body: BeaconBody;

    constructor(buf: Buffer) {
        this.radioTapHeader = new RadioTapHeader(buf.slice(0));
        this.macHeader      = new MacHeader(buf.slice(this.radioTapHeader.length, this.radioTapHeader.length + MacHeader.MAC_HEADER_LENGTH));
        this.body           = new BeaconBody(buf.slice(this.radioTapHeader.length + this.macHeader.length));
    }

    toObject() {
        return {
            radioTapHeader: this.radioTapHeader.toObject(),
            macHeader: this.macHeader.toObject(),
            body: this.body.toObject(),
        }
    }
}

export enum GroupCipherSuiteType {
    UseGroupCipherSuite = 0,
    WEP40               = 1,
    TKIP                = 2,
    RESERVED            = 3,
    CCMP                = 4,
    WEP104              = 5,
}

export enum AuthenticationCipherSuiteType {
    PMKCaching      = 1,
    PreSharedKey    = 2,
}

interface CipherSuite {
    oui: OUI;
    suiteType: number;
}

export interface SecurityInformation {
    version: number;
    groupCipherSuite: CipherSuite;
    pairwiseCipherSuites: CipherSuite[];
    authenticationCipherSuites: CipherSuite[];
    RSNCapabilities: number;
}

export class BeaconBody {
    // Timestamp (as microseconds) - 8 bytes
    // Time on the access point
    timestamp: bigint;

    // Number of time units between TBTT - 2 bytes
    beaconInterval: number;

    // Requested or advertised optional capabilities - 2 bytes
    capabilityInfo: number;

    // Wi-fi name
    ssid: string;

    // Current channel number
    currentChannel?: number;

    // Robust Secure Network
    rsn?: SecurityInformation;


    wpa?: SecurityInformation;
    vendorSpecificOUIs?: OUI[];


    constructor(buf: Buffer) {
        this.timestamp      = buf.readBigUInt64LE(0);
        this.beaconInterval = buf.readUInt16LE(8);
        this.capabilityInfo = buf.readUInt16LE(10);

        const ssidElementId = buf.readUInt8(12);
        const ssidLength    = buf.readUInt8(13);

        this.ssid           = buf.slice(14, 14 + ssidLength).toString('ascii');

        let offset = 14 + ssidLength;
        while (offset < buf.byteLength) {
            const elementId     = buf.readUInt8(offset);
            const elementLength = buf.readUInt8(offset + 1);

            const element       = buf.slice(offset + 2, offset + 2 + elementLength);

            // Incomplete buffer
            if (element.byteLength < elementLength) return;

            switch (elementId) {
                // DS Parameter Set
                case 3:
                    this.currentChannel = element.readUInt8(0);
                    break;

                case 48:    // RSN Information (Robust Security Network)
                case 221:   // Vendor specific information
                    try {
                        let rsnOffset = 0;

                        if (elementId === 221) {
                            const vendor = new OUI(element.slice(rsnOffset, rsnOffset + 3));
                            if (!this.vendorSpecificOUIs) this.vendorSpecificOUIs = [];
                            this.vendorSpecificOUIs.push(vendor);

                            const vendorOUIType = element.readUInt8(rsnOffset + 3);
                            if (vendor.toString().toLowerCase() !== '00:50:f2' || vendorOUIType !== 1) break;

                            rsnOffset += 4;
                        }

                        const version = element.readUInt16LE(rsnOffset);
                        rsnOffset += 2;

                        const groupCipherSuite: CipherSuite = {
                            oui: new OUI(element.slice(rsnOffset, rsnOffset + 3)),
                            suiteType: element.readUInt8(rsnOffset + 3)
                        };
                        rsnOffset += 4;

                        const getCipherSuites = (rsnOffset: number, element: Buffer) => {
                            const cipherSuites: CipherSuite[] = [];
                            const cipherCount = element.readUInt16LE(rsnOffset);
                            rsnOffset += 2;

                            for (let cipherIdx = 0; cipherIdx < cipherCount; cipherIdx++) {
                                const cipher: CipherSuite = {
                                    oui: new OUI(element.slice(rsnOffset, rsnOffset + 3)),
                                    suiteType: element.readUInt8(rsnOffset + 3)
                                };
                                cipherSuites.push(cipher);
                                rsnOffset += 4;
                            }

                            return { cipherSuites, rsnOffset };
                        };

                        let result = getCipherSuites(rsnOffset, element);
                        const pairwiseCipherSuites: CipherSuite[] = result.cipherSuites;
                        rsnOffset = result.rsnOffset;

                        result = getCipherSuites(rsnOffset, element);
                        const authenticationCipherSuites: CipherSuite[] = result.cipherSuites;
                        rsnOffset = result.rsnOffset;

                        let RSNCapabilities = 0;
                        if (elementId === 48) {
                            RSNCapabilities = element.readUInt16BE(rsnOffset);
                            rsnOffset += 2;
                        }

                        const obj: SecurityInformation = {
                            version,
                            groupCipherSuite,
                            pairwiseCipherSuites,
                            authenticationCipherSuites,
                            RSNCapabilities
                        };

                        if (elementId === 221) this.wpa = obj;
                        else this.rsn = obj;
                    } catch (err) {
                        console.error(err);
                        console.log(this.ssid);
                        console.log(buf.slice(offset, offset + 2 + elementLength).toString('hex'));
                    }
                    break;
            }

            offset = offset + 2 + elementLength;
        }
    }

    toString() {
        let str = `---- Beacon Body ------------------------------
  * Timestamp       : ${ this.timestamp } us 
  * Beacon Interval : ${ this.beaconInterval }
  * SSID            : ${ this.ssid }
  * Current channel : ${ this.currentChannel }`;
        if (this.vendorSpecificOUIs) {
            str += `
  * Vendors`;
            this.vendorSpecificOUIs.forEach((vendor) => {
                str += `
        --> ${ vendor.toString() }`;
            });
        }
        if (this.rsn) {
            str += `
  * RSN
${ toString(this.rsn) }`;
        }
        if (this.wpa) {
            str += `
  * WPA
${ toString(this.wpa) }
----------------------------------------------------`;
        }
        return str;
    }

    toObject() {
        return {
            timestamp: this.timestamp.toString(),
            beaconInterval: this.beaconInterval,
            capabilityInfo: this.capabilityInfo,
            ssid: this.ssid,
            currentChannel: this.currentChannel,
            rsn: this.rsn ? toObject(this.rsn) : undefined,
            wpa: this.wpa ? toObject(this.wpa) : undefined,
            vendorSpecificOUIs: this.vendorSpecificOUIs?.map(oui => oui.toString())
        }
    }
}
