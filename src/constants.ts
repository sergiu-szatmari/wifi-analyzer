class ConstDef {
    wifiChannels = {
        // 2.4 GHz
         1: '2.412 GHz',
         2: '2.417 GHz',
         3: '2.422 GHz',
         4: '2.427 GHz',
         5: '2.432 GHz',
         6: '2.437 GHz',
         7: '2.442 GHz',
         8: '2.447 GHz',
         9: '2.452 GHz',
        10: '2.457 GHz',
        11: '2.462 GHz',
        12: '2.467 GHz',
        13: '2.472 GHz',

        // 5 GHz
         36: '5.18 GHz',
         40: '5.2 GHz',
         44: '5.22 GHz',
         48: '5.24 GHz',
         52: '5.26 GHz',
         56: '5.28 GHz',
         60: '5.3 GHz',
         64: '5.32 GHz',
        100: '5.5 GHz',
        104: '5.52 GHz',
        108: '5.54 GHz',
        112: '5.56 GHz',
        116: '5.58 GHz',
        120: '5.6 GHz',
        124: '5.62 GHz',
        128: '5.64 GHz',
        132: '5.66 GHz',
        136: '5.68 GHz',
        140: '5.7 GHz',
    };

    appType = {
        sniffer: 'sniffer',
        analyzer: 'analyzer'
    };

    device = 'wlo1';

    wifiChannelChangeInterval = 500; // 0.5 seconds
}

export const Constants = new ConstDef();
