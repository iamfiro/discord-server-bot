import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, Colors, ContextMenuCommandBuilder, ContextMenuCommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import handleSanctionCommandRequest from "../handler/sanctions";

async function handler(target: string, interaction: ContextMenuCommandInteraction) {
    handleSanctionCommandRequest({ interaction, target, type: 'kick', channelId: process.env.KICK_LOG_CHANNEL || '', title: '서버 추방' })
}

export default {
    info: new ContextMenuCommandBuilder().setName("서버 추방").setType(ApplicationCommandType.User),
    handler,
}