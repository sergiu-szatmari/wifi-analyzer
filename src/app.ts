import { green } from 'cli-color';
import pcap, { PcapSession, PacketWithHeader } from 'pcap';
import { PacketHeader } from "./models/packet-header";
import { TcpPacket } from "./models/tcp-packet";
import { BeaconPacket } from "./models/beacon-packet";

const mode = process.argv[2] || 'sniffer';
const deviceName = process.argv[3] || 'wlo1';

const filter = (() => {
    switch (mode) {
        case 'sniffer': return 'tcp';
        // case 'analyzer': return 'type mgt subtype beacon';
        case 'analyzer': return 'wlan type mgt subtype beacon';
    }
})();

const session: PcapSession = pcap.createSession(deviceName, { promiscuous: true, filter });
const linkType = session.link_type;

console.log(`Listening on ${ green((session as any).device_name) }`);
console.log(`Link type: ${ linkType }`);

session.on('packet', (rawPacket: PacketWithHeader) => {

    const header = new PacketHeader(rawPacket.header);
    console.log(`------------ [ ${ linkType } ] [ ${ header.timestamp.toString() } ] ------------`);

    try {
        if (mode === 'analyzer') {
            const packet = new BeaconPacket(rawPacket.buf);

            console.log(packet.radioTapHeader.toString());
            console.log(packet.macHeader.toString());
            console.log(packet.body.toString());
            console.log()
        } else {
            const packet = new TcpPacket(rawPacket.buf.slice(0, header.caplen));

            console.log(packet.ethernetHeader.toString());
            console.log(packet.ipHeader.toString());
            console.log(packet.tcpHeader.toString());

            if (packet.tcpHeader.destPort === 80 && packet.payload) console.log(packet.payload.toString());
            console.log()
        }
    } catch (err) {
        console.error(err);
    }
});


