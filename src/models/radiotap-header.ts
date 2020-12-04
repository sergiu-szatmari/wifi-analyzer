interface RadioTapField {
    align: number;  // Required alignment in bytes
    length: number; // field length in bytes
}

const radioTapFields: { [key: number]: RadioTapField } = {
     0: { align: 8, length: 8 }, // TSFT
     1: { align: 1, length: 1 }, // Flags
     2: { align: 1, length: 1 }, // Rate
     3: { align: 2, length: 4 }, // Channel
     4: { align: 2, length: 2 }, // FFHS
     5: { align: 1, length: 1 }, // Antenna Signal
     6: { align: 1, length: 1 }, // Antenna Noise
     7: { align: 2, length: 2 }, // Lock Quality
     8: { align: 2, length: 2 }, // TX Attenuation
     9: { align: 2, length: 2 }, // DB TX Attenuation
    10: { align: 1, length: 1 }, // TX Power
    11: { align: 1, length: 1 }, // Antenna
    12: { align: 1, length: 1 }, // DB Antenna signal
    13: { align: 1, length: 1 }, // DB Antenna Noise
    14: { align: 2, length: 2 }, // RX Flags
    15: { align: 2, length: 2 }, // TX Flags
    16: { align: 1, length: 1 }, // RTS Retries
}

export class RadioTapHeader {
    // Version number (currently = 0) - 1 byte
    version: number;

    // Used for padding data only - 1 byte
    pad: number;

    // Entire length of the RadioTap data - 2 bytes
    len: number;

    // Bitmask of the RadioTap data fields
    // that follows the RadioTap header - 4 bytes
    present: number;


    // Fields
    channel?: {
        frequency: number; // 2 bytes
        flags: {
            // 2 bytes
            turbo: boolean;
            CCK: boolean;
            OFDM: boolean;
            TwoGhz: boolean;
            FiveGhz: boolean;
            passiveScan: boolean;
            dynamic: boolean;
            GFSK: boolean;
        };
    };
    antennaSignal?: number // 1 byte


    constructor(buf: Buffer) {
        this.version    = buf.readUInt8();
        this.pad        = buf.readUInt8(1);
        this.len        = buf.readUInt16LE(2);

        let presentFields = buf.readUInt32LE(4);
        let offset = 8;
        this.present = presentFields;
        while (((presentFields >>> 31) & 1) > 0) {
            presentFields = buf.readUInt32LE(offset);
            offset += 4;
        }

        const toParseFields = Object.keys(radioTapFields).length;
        for (let currentFlag = 0; currentFlag < toParseFields; currentFlag++) {
            const field = radioTapFields[currentFlag];
            if (offset % field.align !== 0) {
                // Move offset to correct alignment position
                offset += field.align - (offset % field.align);
            }

            // Check if field is present
            if (((this.present >>> currentFlag) & 1) === 0) continue;

            switch (currentFlag) {
                case 3:
                    // Channel
                    const flagsField = buf.readUInt16LE(offset + 2);
                    this.channel = {
                        frequency: buf.readUInt16LE(offset),
                        flags: {
                            turbo:          (flagsField & 0x0010) > 0,
                            CCK:            (flagsField & 0x0020) > 0,
                            OFDM:           (flagsField & 0x0040) > 0,
                            TwoGhz:         (flagsField & 0x0080) > 0,
                            FiveGhz:        (flagsField & 0x0100) > 0,
                            passiveScan:    (flagsField & 0x0200) > 0,
                            dynamic:        (flagsField & 0x0400) > 0,
                            GFSK:           (flagsField & 0x0800) > 0,
                        }
                    };
                    break;

                case 5:
                    // Antenna Signal
                    this.antennaSignal = buf.readUInt8(offset);
                    break;
            }

            offset += field.length;
        }
    }

    get length(): number {
        return this.len;
    }

    toString() {
        return `Radiotap Header ==========================
  * Version               : ${ this.version }
  * Pad                   : ${ this.pad };
  * Length                : ${ this.len };
  * Present               : ${ this.present.toString(2) }
  * Channel
    * Frequency           : ${ ((this.channel?.frequency ?? 0) / 1000)?.toFixed(3) } GHz
    * Flags
      * Turbo             : ${ this.channel?.flags?.turbo }
      * CCK               : ${ this.channel?.flags?.CCK }
      * ODFM              : ${ this.channel?.flags?.OFDM }
      * 2 Ghz             : ${ this.channel?.flags?.TwoGhz }
      * 5 Ghz             : ${ this.channel?.flags?.FiveGhz }
      * Only passive scan : ${ this.channel?.flags?.passiveScan }
      * Dynamic CCK-OFDM  : ${ this.channel?.flags?.dynamic }
      * GFSK              : ${ this.channel?.flags?.GFSK }
  * Antenna signal        : ${ this.antennaSignal }`;
    }
}