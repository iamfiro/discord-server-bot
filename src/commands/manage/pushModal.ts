import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import Logger from "../../lib/logger";
import { EmbedCommandSuccess, EmbedWelcome } from "../../lib/common/embed";
import { client } from "../../lib/bot";

const logger = new Logger();

async function handle(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString("종류");
    const channel = interaction.options.getChannel("채널");
    if(!type || !channel) logger.error("Push Modal Command Type is not provided");

    switch(type) {
        case "welcome_modal":
            const embed = EmbedWelcome();
            const button = new ButtonBuilder()
                .setCustomId("welcome_button")
                .setLabel("입장권 발급받기")
                .setEmoji("🧾")
                .setStyle(ButtonStyle.Success)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            (client.channels.cache.get(channel?.id || '') as TextChannel).send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                embeds: [EmbedCommandSuccess()],
                ephemeral: true
            });
        default:
            logger.error("Unknown Modal Type");
            break;
    }
}

export default {
    info: new SlashCommandBuilder()
    .setName("모달세팅")
    .setDescription("[ 🔒 ] 모달을 세팅합니다")
    .addStringOption((option) => 
        option
            .setName("종류")
            .setDescription("모달 종류를 선택해주세요")
            .setRequired(true)
            .addChoices([
                {
                    name: "입장 모달",
                    value: "welcome_modal"
                },
            ])
    )
    .addChannelOption((option) =>
        option
            .setName("채널")
            .setDescription("모달을 전송할 채널을 선택해주세요")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    )
    ,
    handle
}