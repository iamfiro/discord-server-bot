import { Colors, EmbedBuilder, ModalSubmitInteraction, TextChannel, userMention } from "discord.js";
import { client } from "../lib/bot";
import Logger from "../lib/logger";
import prisma from "../lib/prisma";
import { EmbedError } from "../lib/common/embed";

const logger = new Logger();

/**
 * 주어진 제재 유형에 대한 이름을 반환합니다.
 * @param type 제재 유형 (kick, ban, increaseWarn, decreaseWarn)
 * @returns 제재 유형의 이름
 */
function TypeToName(type: string): string {
    switch (type) {
        case 'kick':
            return '서버 추방';
        case 'ban':
            return '서버 차단';
        case 'increaseWarn':
            return '경고 추가';
        case 'decreaseWarn':
            return '경고 차감';
        default:
            return '알 수 없음';
    }
}

/**
 * 임베드를 생성하는 유틸리티 함수입니다.
 * @param title 제목
 * @param description 설명
 * @param color 색상
 * @returns EmbedBuilder 인스턴스
 */
function createEmbed(title: string, description: string, color: any): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

/**
 * 로그를 전송하는 함수입니다.
 * @param channelId 로그 채널 ID
 * @param embed 전송할 EmbedBuilder
 */
async function sendLog(channelId: string, embed: EmbedBuilder): Promise<void> {
    const logChannel = client.channels.cache.get(channelId) as TextChannel;
    if (logChannel) {
        await logChannel.send({ embeds: [embed] });
    } else {
        logger.error(`Log channel not found: ${channelId}`);
    }
}

/**
 * 경고를 증가시키는 함수입니다.
 * @param targetId 대상 사용자 ID
 * @param reason 사유
 */
async function increaseWarning(targetId: string, reason: string): Promise<void> {
    try {
        await prisma.userWarn.create({ data: { userId: targetId, reasons: reason } });
        logger.info(`Added a warning to ${targetId}`);
        await prisma.user.update({ where: { userId: targetId }, data: { warningsCount: { increment: 1 } } });
        logger.info(`Increased warning count of ${targetId}`);
    } catch (error) {
        logger.error(`Error adding a warning to ${targetId}: ${error}`);
        throw error;
    }
}

/**
 * 경고를 감소시키는 함수입니다.
 * @param targetId 대상 사용자 ID
 */
async function decreaseWarning(targetId: string): Promise<void> {
    try {
        await prisma.user.update({ where: { userId: targetId }, data: { warningsCount: { decrement: 1 } } });
        logger.info(`Decreased a warning from ${targetId}`);
    } catch (error) {
        logger.error(`Error decreasing a warning from ${targetId}: ${error}`);
        throw error;
    }
}

/**
 * 제재를 처리하는 함수입니다.
 * @param interaction ModalSubmitInteraction 객체
 */
export default async function handleSanctions(interaction: ModalSubmitInteraction): Promise<void> {
    const reason: string = interaction.fields.getTextInputValue("input-reason");
    const [type, channelId, targetId] = interaction.customId.split('-');
    const targetUser = await client.users.fetch(targetId);

    const embed = createEmbed(
        "🚨 제재 적용",
        `유형: ${TypeToName(type)}\n대상: ${targetUser.tag} (${targetId})\n사유: \`\`\`${reason}\`\`\``,
        Colors.Red
    ).setThumbnail(targetUser.displayAvatarURL());

    const guild = client.guilds.cache.get(interaction.guildId || '');
    if (!guild) {
        logger.error(`Guild not found: ${interaction.guildId}`);
        return;
    }

    const member = guild.members.cache.get(targetId);
    if (!member) {
        logger.error(`Member not found: ${targetId}`);
        return;
    }

    try {
        switch (type) {
            case 'kick':
                await member.kick(reason);
                interaction.reply({
                    embeds: [createEmbed("🚨 서버 추방", `${userMention(targetId)} 님을 서버에서 추방했습니다.`, Colors.Red)],
                    ephemeral: true
                });
                break;
            case 'ban':
                await member.ban({ reason });
                interaction.reply({
                    embeds: [createEmbed("🚨 서버 차단", `${userMention(targetId)} 님을 서버에서 차단했습니다.`, Colors.Red)],
                    ephemeral: true
                });
                break;
            case 'increaseWarn':
                await increaseWarning(targetId, reason);
                interaction.reply({
                    embeds: [
                        createEmbed(
                            "🚨 경고 추가",
                            `${userMention(targetId)} 님에게 1회 경고를 추가했습니다.\n경고가 5회 이상일 경우 서버에서 추방될 수 있습니다.`,
                            Colors.Red
                        )
                    ]
                });
                break;
            case 'decreaseWarn':
                await decreaseWarning(targetId);
                interaction.reply({
                    embeds: [createEmbed("✅ 경고 차감", `${userMention(targetId)} 님의 경고를 1회 차감했습니다.`, Colors.Green)]
                });
                break;
            default:
                logger.error(`Unknown sanction type: ${type}`);
                return;
        }

        // 로그 전송
        await sendLog(channelId, embed);
    } catch (error) {
        logger.error(`Error handling sanction (${type}): ${error}`);
        interaction.reply({ embeds: [EmbedError('제재 처리 중 오류가 발생했습니다.')] });
    }
}