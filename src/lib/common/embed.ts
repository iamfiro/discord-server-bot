import { Colors, EmbedBuilder } from "discord.js";

export const EmbedError = (message: string): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle("⚠️ 내부적인 오류 발생")
        .setDescription(message)
        .setColor(Colors.Red);
}

export const EmbedCommandSuccess = (): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle("✅ 명령어 실행 성공")
        .setDescription("명령어가 성공적으로 실행됨")
        .setColor(Colors.Green);
}

export const EmbedWelcome = (): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle("🎉 환영합니다!")
        .setDescription(`
            이 입장권은 서버에서 1달동안 활동이 없으면 만료돼요.
            대충 ㅁㄴㅇㄹ
        `)
        .setColor(Colors.Green);
}