import { Colors, EmbedBuilder, ModalSubmitInteraction, TextChannel, userMention } from "discord.js";
import { client } from "../lib/bot";

function TypeToName(type: string) {
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

export default async function handleSanctions(interaction: ModalSubmitInteraction) {
    console.log(
        'asd'
    )
    const reason = interaction.fields.getTextInputValue("input-reason");
    const [type, channelId, targetId] = interaction.customId.split('-');
    const targetUser = await client.users.fetch(targetId);

    const Embed = new EmbedBuilder()
        .setTitle("🚨 재제 적용")
        .setFields([
            {
                name: "유형",
                value: TypeToName(type),
            },
            {
                name: "대상",
                value: `${targetUser.globalName}(${targetId})`,
            },
            {
                name: "사유",
                value: `\`\`\`${reason}\`\`\``,
            }
        ])
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp()
        .setColor(Colors.Red);

    // 기능 구현
    switch (type) {
        case 'kick':
            // Kick the user
            break;
        case 'increaseWarn':
            // Increase the user's warn count
            interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle("🚨 경고 추가")
                    .setColor(Colors.Red)
                    .setDescription(`${userMention(targetId)} 님에게 1회 경고를 추가했습니다.`)
                    .setFooter({ text: '경고가 5회 이상일 경우 서버에서 추방될 수 있습니다.' })
            ] });
            break;
        
    }

    // 로그 전송
    (client.channels.cache.get(channelId) as TextChannel).send({ embeds: [Embed] })
}