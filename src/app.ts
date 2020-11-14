import { green } from 'cli-color';
import pcap, { PcapSession, PacketWithHeader } from 'pcap';
import { PacketHeader } from "./models/packet-header";
import { TcpPacket } from "./models/tcp-packet";

const mode = process.argv[2] || 'sniffer';
const deviceName = process.argv[3] || 'wlo1';

const filter = (() => {
    switch (mode) {
        case 'sniffer': return 'tcp';
        case 'analyzer': return 'type mgt subtype beacon';
    }
})();

const session: PcapSession = pcap.createSession(deviceName, { promiscuous: true, filter });
const linkType = session.link_type;

console.log(`Listening on ${ green((session as any).device_name) }`);
console.log(`Link type: ${ linkType }`);

session.on('packet', (rawPacket: PacketWithHeader) => {

    const header = new PacketHeader(rawPacket.header);
    console.log(`------------ [ ${ linkType } ] [ ${ header.timestamp.toString() } ] ------------`);

    if (mode === 'analyzer') {
        console.log(rawPacket);
    } else {
        try {
            const packet = new TcpPacket(rawPacket.buf.slice(0, header.caplen));

            console.log(packet.ethernetHeader.toString());
            console.log(packet.ipHeader.toString());
            console.log(packet.tcpHeader.toString());

            if (packet.tcpHeader.destPort === 80 && packet.payload) console.log(packet.payload.toString());
        } catch (err) {
            console.error(err);
        }
        console.log()
    }
});


