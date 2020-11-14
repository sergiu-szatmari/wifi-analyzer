import config from 'config';
import { green, yellow } from 'cli-color';
import pcap, { PcapSession, LiveSessionOptions, PacketWithHeader } from 'pcap';
import { PacketHeader } from "./models/packet-header";
import { TcpPacket } from "./models/tcp-packet";

const deviceName = config.get('deviceName') as string;
const options = {
    promiscuous: true,
    filter: 'tcp'
} as LiveSessionOptions;

const session: PcapSession = pcap.createSession(deviceName, options);
const linkType = session.link_type;

console.log(`Listening on ${ green((session as any).device_name) }`);
console.log(`Link type: ${ linkType }`);

session.on('packet', (rawPacket: PacketWithHeader) => {

    const header = new PacketHeader(rawPacket.header);
    console.log(`------------ [ ${ header.timestamp.toString() } ] ------------`);

    try {
        const packet = new TcpPacket(rawPacket.buf.slice(0, header.caplen));

        if (packet.ipHeader.srcIp.toString() === '89.165.177.52') {
            console.log(yellow(packet.ethernetHeader.toString()));
            console.log(yellow(packet.ipHeader.toString()));
            console.log(yellow(packet.tcpHeader.toString()));

            if (packet.tcpHeader.destPort === 80 && packet.payload) console.log(yellow(packet.payload.toString()));
        } else {
            console.log(packet.ethernetHeader.toString());
            console.log(packet.ipHeader.toString());
            console.log(packet.tcpHeader.toString());

            if (packet.tcpHeader.destPort === 80 && packet.payload) console.log(packet.payload.toString());
        }
    } catch (err) {
        console.error(err);
    }

    console.log()
});


