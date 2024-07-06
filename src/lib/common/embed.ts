import { Colors, EmbedBuilder } from "discord.js";

export const EmbedError = (message: string): EmbedBuilder => {
    return new EmbedBuilder()
        .setTitle("⚠️ 내부적인 오류 발생")
        .setDescription(message)
        .setColor(Colors.Red);
}