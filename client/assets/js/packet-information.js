class PacketInformation {
    signal;
    ssid;
    mac;
    frequency;
    channel;
    vendors;
    rsn;
    wpa;

    constructor(packet) {
        this.signal = packet.radioTapHeader.antennaSignal;
        this.ssid = packet.body.ssid;
        this.mac = packet.macHeader.srcMac;
        this.frequency = packet.radioTapHeader.channel.frequency;
        this.channel = packet.body.currentChannel;
        this.vendors = packet.body.vendorSpecificOUIs;

        this.rsn = packet.body.rsn ? {
            groupCipherSuite: packet.body.rsn.groupCipherSuite,
            akmCipherSuite: packet.body.rsn.authenticationCipherSuites,
        } : undefined;

        this.wpa = packet.body.wpa ? {
            groupCipherSuite: packet.body.wpa.groupCipherSuite,
            akmCipherSuite: packet.body.wpa.authenticationCipherSuites
        } : undefined;
    }
}
