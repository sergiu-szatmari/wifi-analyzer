import { green } from 'cli-color';
import pcap, { PacketWithHeader, PcapSession } from 'pcap';
import { PacketHeader } from "./models/packet-header";
import { TcpPacket } from "./models/tcp-packet";
import { BeaconPacket } from "./models/beacon-packet";
import { changeWifiChannel, sessionConfig } from "./utils/app-utils";
import { Constants } from "./constants";

const mode                      = process.argv[2] || Constants.appType.sniffer;
const device                    = process.argv[3] || Constants.device;
Constants.device                = device;
const { promiscuous, filter }   = sessionConfig(mode);

const session: PcapSession      = pcap.createSession(device, { promiscuous, filter });
const linkType                  = session.link_type;

console.log(`Listening on ${ green((session as any).device_name) }`);
console.log(`Link type: ${ linkType }`);

let wifis: { [key: string]: BeaconPacket } = { };
if (mode === Constants.appType.analyzer) {

    const channels = Object.keys(Constants.wifiChannels).map(channelNumber => parseInt(channelNumber, 10));
    let i = 0;
    setInterval(async () => {
        // Reset to channel 1
        if (i === channels.length) {
            i = 0;
            wifis = { };
        }

        try {
            const channel = await changeWifiChannel(channels[i]);
            console.log(`Successfully changed channel to ${ green(channel) }`);
            i++;
        } catch (err) {
            console.error(err);
        }
    }, Constants.wifiChannelChangeInterval);
}

session.on('packet', (rawPacket: PacketWithHeader) => {

    const header = new PacketHeader(rawPacket.header);
    // console.log(`------------ [ ${ linkType } ] [ ${ header.timestamp.toString() } ] ------------`);

    try {
        let packet;
        switch (mode) {
            case Constants.appType.analyzer:
                packet = new BeaconPacket(rawPacket.buf);
                const { ssid } = packet.body;

                if (!Object.keys(wifis).includes(ssid)) {
                    wifis[ ssid ] = packet;
                    // console.log(packet.radioTapHeader.toString());
                    // console.log(packet.macHeader.toString());
                    console.log(packet.body.toString());
                    console.log()
                }
                break;

            case Constants.appType.sniffer:
                packet = new TcpPacket(rawPacket.buf.slice(0, header.caplen));

                console.log(packet.ethernetHeader.toString());
                console.log(packet.ipHeader.toString());
                console.log(packet.tcpHeader.toString());

                if (packet.tcpHeader.destPort === 80 && packet.payload) console.log(packet.payload.toString());
                console.log()
                break;
        }
    } catch (err) {
        console.error(err);
    }
});


