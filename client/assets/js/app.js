/* Utils */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const DOMElement = (tagName, classList) => {
    const el = document.createElement(tagName);
    if (!!classList && Array.isArray(classList)) classList.forEach(className => { el.classList.add(className) });
    return el;
}

const GroupCipherSuiteType = {
    0: 'UseGroupCipherSuite',
    1: 'WEP40',
    2: 'TKIP',
    3: 'RESERVED',
    4: 'CCMP',
    5: 'WEP104',
};

const AuthenticationCipherSuiteType = {
    1: 'PMKCaching',
    2: 'PreSharedKey',
};

const clamp = (num, min, max) => (num < min ? min : num > max ? max : num);
const numberToRange = (x, a, b, c, d) => ((x - a) / (b - a) * (d - c) + c);
/* --- Utils --- */

const wifis = { };

const app = () => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onerror = () => { console.clear(); setTimeout(app, 1000); } // Retry connection
    socket.onopen = () => { console.log('Connected to the server'); }
    socket.onmessage = ({ data }) => {
        const packet = JSON.parse(data);
        const { ssid } = packet.body;

        if (!Object.keys(wifis).includes(ssid)) {

            const wn = new WifiNetwork(data)
            wifis[ ssid ] = wn;

            $('app').appendChild(wn.render());
        } else {
            const beaconPacket  = JSON.parse(data);
            wifis[ ssid ].update(new PacketInformation(beaconPacket))
        }
    }
};

app();
