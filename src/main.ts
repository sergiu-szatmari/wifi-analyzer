import { Constants } from "./constants";
import { App } from "./application";

const mode = process.argv[2] || Constants.appType.sniffer;

if (process.argv[3]) Constants.device = process.argv[3];

new App(mode).run();
