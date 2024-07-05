import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import handleSanctionCommandRequest from "../handler/sanctions";

async function handler(target: string, interaction: ContextMenuCommandInteraction) {
    handleSanctionCommandRequest({ interaction, target, type: 'ban', channelId: process.env.BAN_LOG_CHANNEL || '', title: '서버 차단' })
}

export default {
    info: new ContextMenuCommandBuilder().setName("서버 차단").setType(ApplicationCommandType.User),
    handler,
}