import { exec } from 'child_process';
import { red, green } from 'cli-color';
import { Constants } from "../constants";

export const sessionConfig = (appType: string) => {
    const promiscuous = true;
    let filter;

    switch (appType) {
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

/**
 * Changes the wifi channel
 * Promise resolves with channel number on success
 * @param channel - the current channel
 */
export const changeWifiChannel = async (channel: number): Promise<number> => {
    return new Promise((onResolve, onError) => {
        exec(`iwconfig ${ Constants.device } channel ${ channel }`, (error, stdout, stderr) => {
            if (error || stderr) onError(`Cannot change channel to ${ channel }`);
            else onResolve(channel);
        })
    });
}
