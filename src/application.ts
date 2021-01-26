import WebSocket from 'ws';
import pcap, { PacketWithHeader, PcapSession } from 'pcap';
import { green, yellow } from 'cli-color';
import { exec } from 'child_process';
import { Constants } from './constants';
import { PacketHeader } from './models/packet-header';
import { BeaconPacket } from './models/beacon-packet';
import { TcpPacket } from './models/tcp-packet';
import { createWebSocket } from './sockets/socket';

export class App {
    private session: PcapSession;
    private socket?: WebSocket;
    wifis?: { [key: string]: BeaconPacket };

    constructor(private appType: string, device: string = Constants.device) {
        if (![ 'sniffer', 'analyzer' ].includes(appType)) throw new Error('Invalid app type. (appType = "sniffer" | "analyzer")');

        // Setting the device name (if other than default)
        Constants.device                = device;
        const { promiscuous, filter }   = this.config();
        this.session                    = pcap.createSession(device, { promiscuous, filter });

        createWebSocket().then(ws => {
            this.socket = ws;
            console.log(`The client has ${ green('connected') }`);
        });
    }

    public run() {
        if (this.appType === Constants.appType.analyzer) {
            this.wifis = { };
            setTimeout(this.initWifiChannelChange, 2000);
        }

        console.log(`Listening on ${ green((this.session as any).device_name) }`);
        console.log(`Link type: ${ this.session.link_type }`);
        this.session.on('packet', this.onPacketHandler);
    }

    private config() {
        const promiscuous = true;
        let filter;

        switch (this.appType) {
            case 'sniffer':
                filter = 'tcp';
                break;

            case 'analyzer':
                filter = 'wlan type mgt subtype beacon';
                break;

            default: throw new Error('Invalid app type');
        }

        return { promiscuous, filter };
    }

    private changeWifiChannel = async (channel: number): Promise<number> => {
        return new Promise((onResolve, onError) => {
            // TODO: Remove this, use the one in utils
            exec(`iwconfig ${ Constants.device } channel ${ channel }`, (error, stdout, stderr) => {
                if (error || stderr) onError(`Cannot change channel to ${ channel }`);
                else onResolve(channel);
            })
        });
    }

    private initWifiChannelChange = () => {

        const channels = Object.keys(Constants.wifiChannels).map(channelNumber => parseInt(channelNumber, 10));
        let i = 0;
        setInterval(async () => {
            // Reset to channel 1
            if (i === channels.length) i = 0;

            try {
                const channel = await this.changeWifiChannel(channels[i]);
                console.log(`Successfully changed channel to ${ green(channel) }`);
                i++;
            } catch (err) {
                console.error(err);
            }
        }, Constants.wifiChannelChangeInterval);
    }

    private onPacketHandler = (rawPacket: PacketWithHeader) => {
        const header = new PacketHeader(rawPacket.header);

        if (header.caplen !== header.len) {
            console.log(yellow('Captured length !== length -- skipping . . .'));
            return;
        }

        try {
            let packet;
            switch (this.appType) {

                case Constants.appType.analyzer:
                    packet = new BeaconPacket(rawPacket.buf);

                    this.socket?.send(JSON.stringify(packet.toObject(), null, 2));

                    console.log(packet.toObject());
                    console.log(packet.body.toString());
                    console.log()
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
            // console.error(err);
        }
    }
}
