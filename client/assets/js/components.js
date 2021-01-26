class Components {
    static signalBars(power) {
        const signal = {
            1: [ 'bad',     'one-bar'       ],
            2: [ 'bad',     'two-bars'      ],
            3: [ 'ok',      'three-bars'    ],
            4: [ 'good',    'four-bars'     ],
            5: [ 'best',    'five-bars'     ],
        };

        const div = DOMElement('div', [ 'signal-bars', 'mt1', 'sizing-box', ...(signal[ power ]) ]);

        [ 'first-bar', 'second-bar', 'third-bar', 'fourth-bar', 'fifth-bar' ]
            .map(className => DOMElement('div', [ 'bar', className ]))
            .forEach(bar => { div.appendChild(bar); });

        return div;
    }

    static cipher(name, cipher, isAKM = false) {
        try {
            const div = DOMElement('div', [ 'cipher' ]);

            const p = DOMElement('p', [ 'cipher-title' ]);
            p.innerHTML = `${ name }`;
            const ul = DOMElement('ul', [ 'cipher-list' ]);

            const oui = DOMElement('li', [ 'cipher-list-element' ]);
            oui.innerHTML = `OUI: ${ cipher.oui }`;

            const type = DOMElement('li', [ 'cipher-list-element' ]);
            type.innerHTML = `Type: ${ isAKM ?
                AuthenticationCipherSuiteType[cipher.suiteType] :
                GroupCipherSuiteType[cipher.suiteType] }`;

            [ oui, type ].forEach(elem => { ul.appendChild(elem); });

            [ p, ul ].forEach(elem => { div.appendChild(elem); });

            return div;
        } catch (err) {
            console.error(err);
            console.log({ name, cipher });
        }
    }

    static security(title, rsn) {
        const container = DOMElement('div', [ 'security' ]);

        const h3 = DOMElement('h3', [ 'title' ]);
        h3.innerHTML = `${ title }`;

        const cipher = Components.cipher('Group Cipher Suite', rsn.groupCipherSuite);
        console.log(`RSN: `, rsn);
        const divs = rsn.akmCipherSuite.map(suite => Components.cipher('AKM Cipher Suite', suite, true));

        [ h3, cipher, ...divs ].forEach(elem => { container.appendChild(elem); });

        return container;
    }
}
