import { ActionRowBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Logger from "../lib/logger";

const logger = new Logger();

/**
 * Represents a request to handle a sanction command.
 */
interface SanctionCommandRequest {
    /** The target user for the sanction. */
    target: string;
    /** The context menu command interaction. */
    interaction: ContextMenuCommandInteraction;
    /** The type of sanction to be applied. */
    type: 'increaseWarn' | 'decreaseWarn' | 'ban' | 'kick';
    /** The ID of the channel where the sanction is applied. */
    channelId: string;
    /** The title of the modal to be displayed. */
    title: string;
}

/**
 * Handles a sanction command request by displaying a modal for input.
 * 
 * @param {SanctionCommandRequest} request - The request data for handling the sanction command.
 * @returns {Promise<void>} A promise that resolves when the modal is shown.
 */
export default async function handleSanctionCommandRequest({ interaction, target, type, channelId, title }: SanctionCommandRequest): Promise<void> {
    try {
        const modal = new ModalBuilder()
            .setCustomId(`${type}-${channelId}-${target}`)
            .setTitle(title);

        const reason = new TextInputBuilder()
            .setCustomId('input-reason')
            .setLabel("사유")
            .setPlaceholder("사유를 입력해주세요.")
            .setStyle(TextInputStyle.Short);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reason);

        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    } catch (error) {
        logger.error(`Error showing sanction modal: ${error}`);
    }
}
