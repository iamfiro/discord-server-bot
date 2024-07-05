import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

async function handler(target: string, interaction: ContextMenuCommandInteraction) {
    const modal = new ModalBuilder()
        .setCustomId(`increaseWarn-${process.env.WARN_LOG_CHANNEL}-${target}`)
        .setTitle("경고 추가")
    
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
    info: new ContextMenuCommandBuilder().setName("경고 추가").setType(ApplicationCommandType.User),
    handler,
}