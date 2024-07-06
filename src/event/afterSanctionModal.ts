import { Colors, EmbedBuilder, ModalSubmitInteraction, TextChannel, userMention } from "discord.js";
import { client } from "../lib/bot";
import Logger from "../lib/logger";
import prisma from "../lib/prisma";

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
 * 제재를 처리하는 함수입니다.
 * @param interaction ModalSubmitInteraction 객체
 */
export default async function handleSanctions(interaction: ModalSubmitInteraction): Promise<void> {
    const reason: string = interaction.fields.getTextInputValue("input-reason");
    const [type, channelId, targetId] = interaction.customId.split('-');
    const targetUser = await client.users.fetch(targetId);

    const embed = new EmbedBuilder()
        .setTitle("🚨 제재 적용")
        .setFields([
            {
                name: "유형",
                value: TypeToName(type),
            },
            {
                name: "대상",
                value: `${targetUser.tag} (${targetId})`,
            },
            {
                name: "사유",
                value: `\`\`\`${reason}\`\`\``,
            }
        ])
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp()
        .setColor(Colors.Red);

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
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("🚨 서버 추방")
                            .setColor(Colors.Red)
                            .setDescription(`${userMention(targetId)} 님을 서버에서 추방했습니다.`)
                    ],
                    ephemeral: true
                });
                break;
            case 'ban':
                await member.ban({ reason });
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("🚨 서버 차단")
                            .setColor(Colors.Red)
                            .setDescription(`${userMention(targetId)} 님을 서버에서 차단했습니다.`)
                    ],
                    ephemeral: true
                });
                break;
            case 'increaseWarn':
                // 경고 추가 처리 로직 (예: 데이터베이스 업데이트) 추가
                prisma.userWarn.create({
                    data: {
                        userId: targetId,
                        reasons: reason,
                    }
                }).then(() => {
                    logger.info(`Added a warning to ${targetId}`);

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("🚨 경고 추가")
                                .setColor(Colors.Red)
                                .setDescription(`${userMention(targetId)} 님에게 1회 경고를 추가했습니다.`)
                                .setFooter({ text: '경고가 5회 이상일 경우 서버에서 추방될 수 있습니다.' })
                        ]
                    });
                }).catch((error) => {
                    logger.error(`Error adding a warning to ${targetId}: ${error}`);
                });
                break;
            default:
                logger.error(`Unknown sanction type: ${type}`);
                return;
        }
    } catch (error) {
        logger.error(`Error handling sanction (${type}): ${error}`);
    }

    // 로그 전송
    const logChannel = client.channels.cache.get(channelId) as TextChannel;
    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    } else {
        logger.error(`Log channel not found: ${channelId}`);
    }
}