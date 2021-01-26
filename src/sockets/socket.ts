import WebSocket from 'ws';
import { green } from 'cli-color';

export const createWebSocket = async (): Promise<WebSocket> => {
    return new Promise((onResolve, onReject) => {
        const port: number = 8080;
        try {
            const socketServer = new WebSocket.Server(
                { port },
                () => { console.log(`Socket server is ${ green('successfully created') } - listening on port ${ green(port) }`)}
            );
            socketServer.on('connection', onResolve);
        } catch (err) {
            onReject(err);
        }
    });
}
