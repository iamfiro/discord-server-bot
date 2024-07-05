import chalk from "chalk";

export default class Logger {
    // 기본 로그
    debug(message: string): void {
        const returnMessage = `${chalk.blueBright('[DEBUG]')} ${message} ${chalk.gray(new Date().toLocaleTimeString())}`;
        return console.log(returnMessage);
    }

    // 에러 로그
    error(message: string): void {
        const returnMessage = `${chalk.redBright('[ERROR]')} ${message} ${chalk.gray(new Date().toLocaleTimeString())}`;
        return console.log(returnMessage);
    }

    // 경고 로그
    warn(message: string): void {
        const returnMessage = `${chalk.yellowBright('[WARN]')} ${message} ${chalk.gray(new Date().toLocaleTimeString())}`;
        return console.log(returnMessage);
    }

    // 정보 로그
    info(message: string): void {
        const returnMessage = `${chalk.greenBright('[INFO]')} ${message} ${chalk.gray(new Date().toLocaleTimeString())}`;
        return console.log(returnMessage);
    }
}