import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, Colors, ContextMenuCommandBuilder, ContextMenuCommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";

async function handler(target: string, interaction: ContextMenuCommandInteraction) {
    const modal = new ModalBuilder()
        .setCustomId(`kick-${process.env.KICK_LOG_CHANNEL}-${target}`)
        .setTitle("서버 추방")
    
    const reason = new TextInputBuilder()
        .setCustomId('input-reason')
        .setLabel("사유")
        .setPlaceholder("사유를 입력해주세요.")
        .setStyle(TextInputStyle.Short);
    
    const ActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reason);

    modal.addComponents(ActionRow);

    await interaction.showModal(modal)
}

export default {
    info: new ContextMenuCommandBuilder().setName("서버 추방").setType(ApplicationCommandType.User),
    handler,
}