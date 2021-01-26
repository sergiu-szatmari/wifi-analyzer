# Wi-Fi Analyzer & Packet Sniffer
Wi-fi analyzer/sniffer app created with Node.js.

## Usage

* Install _libpcap_ (`sudo apt-get install libpcap-dev`)
* Install airmon-ng, needed for enabling _monitor mode_ (`sudo apt-get install aircrack-ng`)
* Install needed node.js packages (`npm install`)
* Install _Sass_ (`npm install -g sass`)

### Running the sniffer 
`npm run sniffer`

### Running the wi-fi analyzer
```
sudo ./start-monitor-mode.sh
npm run analyzer
```
The client might fail to run if Google Chrome is not installed, but it can be opened manually from **_client/index.html_**

Run `sudo ./start-managed-mode.sh` to 

### References
#### TCP Packet:
* [Packet Header](https://wiki.wireshark.org/Development/LibpcapFileFormat#Record_.28Packet.29_Header)
* [Ethernet Frames](https://en.wikipedia.org/wiki/Ethernet_frame)
* [EtherType](https://en.wikipedia.org/wiki/EtherType)
* [IPv4 Header](https://en.wikipedia.org/wiki/IPv4)
* [IP Protocols](https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers)
* [TCP Header](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)

#### Beacon Packet:
* RadioTap - [#1](http://wifinigel.blogspot.com/2013/11/what-are-radiotap-headers.html), [#2](https://www.radiotap.org/), [#3](https://github.com/radiotap/radiotap-library/blob/master/radiotap.c), [#4 (Defined RadioTap Fields)](https://www.radiotap.org/fields/defined)
* [Beacon Frame](https://mrncciew.com/2014/10/08/802-11-mgmt-beacon-frame)
* [Robust Security Network](https://www.oreilly.com/library/view/80211-wireless-networks/0596100523/ch04.html#wireless802dot112-CHP-4-SECT-3.3.22)
