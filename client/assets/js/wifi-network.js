

class WifiNetwork {

    information;

    signalDomElement = null;

    constructor(data) {
        const beaconPacket  = JSON.parse(data);
        this.information    = new PacketInformation(beaconPacket);
    }

    render() {
        const card = DOMElement('div', [ 'wifi-network' ]);

        const header = DOMElement('div', [ 'header' ]);

        const name = DOMElement('div', [ 'name' ]);
        name.innerHTML = this.information.ssid;

        const power = numberToRange(clamp(this.information.signal, -90, -30), -90, -30, 1, 5);
        console.log({ power });
        console.log({ signal: this.information.signal });
        const signal = DOMElement('div', [ 'signal' ]);
        signal.appendChild(Components.signalBars(Math.round(power)));

        // Used for later update
        this.signalDomElement = signal;

        [ name, signal ].forEach(element => { header.appendChild(element); });

        const subheader = DOMElement('div', [ 'subheader' ]);

        const line1 = DOMElement('div', [ 'line' ]);
        line1.innerHTML = `MAC: ${ this.information.mac.toUpperCase() }`;

        const line2 = DOMElement('div', [ 'line' ]);
        line2.innerHTML = `Frequency: ${ (this.information.frequency / 1000).toFixed(3) } GHz`;

        const line3 = DOMElement('div', [ 'line' ]);
        line3.innerHTML = `Channel: ${ this.information.channel }`;

        const line4 = DOMElement('div', [ 'line' ]);
        line4.innerHTML = `Vendors: ${ this.information.vendors.join(', ') }`;

        [ line1, line2, line3, line4 ].forEach(line => { subheader.appendChild(line) });

        const content = DOMElement('div', [ 'content' ]);

        const securityDetails = [];
        if (this.information.rsn) securityDetails.push(Components.security('RSN', this.information.rsn));
        if (this.information.wpa) securityDetails.push(Components.security('WPA', this.information.wpa));
        securityDetails.forEach(element => { content.appendChild(element) });

        [ header, subheader, content ].forEach(element => { card.appendChild(element); });

        return card;
    }

    update(beaconPacket) {
        const power = numberToRange(clamp(beaconPacket.signal, -90, -30), -90, -30, 1, 5);
        const newSignalChild = Components.signalBars(Math.round(power));

        const oldNode = this.signalDomElement.childNodes[0];
        this.signalDomElement.removeChild(oldNode);
        this.signalDomElement.appendChild(newSignalChild);

        console.log(`On update data for ${ this.information.ssid } -> new power (${ Math.round(power) })`);
    }
}
