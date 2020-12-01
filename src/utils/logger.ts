class Logger {

    private static instance: Logger;
    private constructor() {
    }

    public static getInstance(): Logger {
        if (!this.instance) {
            this.instance = new Logger();
        }

        return this.instance;
    }

    public static init() {

    }
}