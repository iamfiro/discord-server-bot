import { 
    ApplicationCommandType, 
    ContextMenuCommandBuilder, 
    ContextMenuCommandInteraction 
} from "discord.js";
import handleSanctionCommandRequest from "../handler/requestSanctionModal";

/**
 * 경고 차감 명령어를 처리하는 함수입니다.
 * @param target 대상 유저의 ID
 * @param interaction ContextMenuCommandInteraction 객체
 */
async function handler(target: string, interaction: ContextMenuCommandInteraction): Promise<void> {
    const channelId = process.env.WARN_LOG_CHANNEL || '';
    if (!channelId) {
        throw new Error("WARN_LOG_CHANNEL environment variable is not set.");
    }

    await handleSanctionCommandRequest({ 
        interaction, 
        target, 
        type: 'decreaseWarn', 
        channelId, 
        title: '경고 차감' 
    });
}

export default {
    info: new ContextMenuCommandBuilder()
        .setName("경고 차감")
        .setType(ApplicationCommandType.User),
    handler,
}