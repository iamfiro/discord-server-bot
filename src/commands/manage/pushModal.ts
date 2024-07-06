import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import Logger from "../../lib/logger";
import { EmbedCommandSuccess, EmbedWelcome } from "../../lib/common/embed";
import { client } from "../../lib/bot";

const logger = new Logger();

/**
 * Handles the interaction for setting up modals.
 * 
 * @param {ChatInputCommandInteraction} interaction - The interaction object.
 */
async function handle(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString("종류");
    const channel = interaction.options.getChannel("채널") as TextChannel | null;

    if (!type || !channel) {
        logger.error("Push Modal Command Type or Channel is not provided");
        return interaction.reply({
            content: "명령어가 올바르지 않습니다. '종류'와 '채널'을 모두 제공해주세요.",
            ephemeral: true,
        });
    }

    switch(type) {
        case "welcome_modal":
            await sendWelcomeModal(channel);
            return interaction.reply({
                embeds: [EmbedCommandSuccess()],
                ephemeral: true
            });
        default:
            logger.error("Unknown Modal Type");
            return interaction.reply({
                content: "알 수 없는 모달 유형입니다.",
                ephemeral: true,
            });
    }
}

/**
 * Sends a welcome modal to the specified text channel.
 * 
 * @param {TextChannel} channel - The channel to send the welcome modal to.
 */
async function sendWelcomeModal(channel: TextChannel) {
    const embed = EmbedWelcome();
    const button = new ButtonBuilder()
        .setCustomId("welcome_button")
        .setLabel("입장권 발급받기")
        .setEmoji("🧾")
        .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await channel.send({
        embeds: [embed],
        components: [row]
    });
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
        ),
    handle
}