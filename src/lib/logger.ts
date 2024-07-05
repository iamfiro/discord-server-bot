import chalk from "chalk";

export default class Logger {
    private log(level: string, message: any, color: (text: string) => string): void {
        const prefix = `[${level}]`;
        const timestamp = chalk.gray(new Date().toLocaleTimeString());
        console.log(`${color(prefix)} ${message} ${timestamp}`);
    }

    debug(message: any): void {
        this.log('DEBUG', message, chalk.blueBright);
    }

    error(message: any): void {
        this.log('ERROR', message, chalk.redBright);
    }

    warn(message: any): void {
        this.log('WARN', message, chalk.yellowBright);
    }

    info(message: any): void {
        this.log('INFO', message, chalk.greenBright);
    }
}