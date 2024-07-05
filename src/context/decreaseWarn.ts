import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import handleSanctionCommandRequest from "../handler/sanctions";

async function handler(target: string, interaction: ContextMenuCommandInteraction) {
    handleSanctionCommandRequest({ interaction, target, type: 'decreaseWarn', channelId: process.env.WARN_LOG_CHANNEL || '', title: '경고 차감' })
}

export default {
    info: new ContextMenuCommandBuilder().setName("경고 차감").setType(ApplicationCommandType.User),
    handler,
}