import { ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember, Message, PermissionFlagsBits, SlashCommandBuilder, TextChannel, userMention } from 'discord.js';

/** 
 * @param {ChatInputCommandInteraction} interaction - The interaction event.
 * @returns {Promise<void>}
 * @description 메시지를 삭제하는 명령어입니다.
 * @name handle
 */
async function handle(interaction: ChatInputCommandInteraction) {
    const { channel } = interaction;

    // Amount가 null일 수 있으므로 기본값을 0으로 설정
    const Amount = interaction.options.getInteger("갯수") ?? 0;
    const Target = interaction.options.getMember("유저") as GuildMember | null;

    // 채널에서 메시지를 가져오고, 올바른 타입으로 선언
    const Messages = await (channel?.messages.fetch() ?? Promise.resolve(new Collection<string, Message>()));

    // 특정 유저의 메시지를 삭제하는 경우
    if (Target) {
        let i = 0;
        const filtered: Message[] = [];
        // 유저 ID가 일치하고 아직 삭제할 메시지 수를 초과하지 않은 경우 필터링
        Messages.filter((m: Message) => {
            if (m.author.id === Target.id && Amount > i) {
                filtered.push(m);
                i++;
            }
        });

        // 필터링된 메시지를 삭제
        if (channel) {
            await (interaction.channel as any as TextChannel).bulkDelete(filtered, true).then((messages) => {
                const embed2 = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🗑️ 채팅 청소")
                    .addFields(
                        { name: "✅ 특정 유저 채팅 청소 완료", value: "정상적으로 특정 유저의 채팅의 청소가 완료되었습니다." },
                        { name: "청소 시도한 메시지 갯수", value: `${Amount}`, inline: true },
                        { name: "청소된 메시지 갯수", value: `${messages.size}`, inline: true },
                        { name: "청소한 특정유저", value: `${userMention(Target.user.id)}`, inline: true }
                    )
                    .setTimestamp();
                interaction.reply({ embeds: [embed2] });
            });
        }
    } else {
        // 특정 유저가 아닌 모든 메시지를 삭제하는 경우
        if (channel) {
            await (interaction.channel as any as TextChannel).bulkDelete(Amount, true).then((messages) => {
                const embed2 = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🗑️ 채팅 청소")
                    .addFields(
                        { name: "✅ 청소 완료", value: "정상적으로 청소가 완료되었습니다." },
                        { name: "청소 시도한 메시지 갯수", value: `${Amount}`, inline: true },
                        { name: "청소된 메시지 갯수", value: `${messages.size}`, inline: true }
                    )
                    .setTimestamp();
                interaction.reply({ embeds: [embed2], ephemeral: true });
            });
        }
    }
}

// 명령어 정보 및 설정
export default {
    info: new SlashCommandBuilder()
        .setName("청소")
        .setDescription(`[ 🔒 ] 메시지 청소를 합니다.`)
        .addIntegerOption((option) =>
            option
                .setName("갯수")
                .setDescription("청소하실 채팅 갯수를 1에서 100의 수를 입력해주세요.")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("유저")
                .setDescription("유저를 선택하면 그 유저가 보낸 메세지만 삭제합니다.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    handle
}