import { Colors, EmbedBuilder, Message, TextChannel, userMention } from "discord.js";
import Logger from "../lib/logger";
import prisma from "../lib/prisma";

const logger = new Logger();
const NOTIFY_CHANNEL_ID: string = process.env.LEVEL_LOG_CHANNEL || ''; // 알림을 보낼 채널의 ID를 설정하세요

/**
 * 사용자가 메시지를 보낼 때 XP를 1 증가시키고, XP가 100의 배수가 될 때 레벨 업 알림을 보냅니다.
 * 
 * @param {Message} message - Discord.js의 메시지 객체.
 */
async function handle(message: Message) {
    // 봇이 보낸 메시지는 무시합니다.
    if (message.author.bot) return;
    try {
        // 사용자 XP를 1 증가시키고, 업데이트된 XP 값을 가져옵니다.
        const user = await prisma.user.update({
            where: {
                userId: message.author.id,
            },
            data: {
                xp: {
                    increment: BigInt(1),
                },
            },
            select: {
                xp: true,
            },
        });

        // XP가 100의 배수인지 확인합니다.
        if (user.xp % BigInt(100) === BigInt(0)) {
            // 새로운 레벨을 계산합니다.
            const newLevel = user.xp / BigInt(100);
            const channel = message.client.channels.cache.get(NOTIFY_CHANNEL_ID) as TextChannel;
            if (channel) {
                // 알림 채널에 레벨 업 메시지를 보냅니다.
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`🎉 ${userMention(message.author.id)} 님이 ${newLevel} 레벨로 올랐습니다!`)
                            .setColor(Colors.Green)
                    ]
                })
            } else {
                logger.error('알림 채널을 찾을 수 없습니다.');
            }
        }
    } catch (error) {
        // XP 증가에 실패한 경우 오류를 기록합니다.
        logger.error(`XP 증가 실패: ${error}`);
    }
}

export default {
    handle,
};