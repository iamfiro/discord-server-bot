import { 
    ApplicationCommandType, 
    ContextMenuCommandBuilder, 
    ContextMenuCommandInteraction 
} from "discord.js";
import handleSanctionCommandRequest from "../handler/requestSanctionModal";

/**
 * 서버 차단 명령어를 처리하는 함수입니다.
 * @param target 대상 유저의 ID
 * @param interaction ContextMenuCommandInteraction 객체
 */
async function handler(target: string, interaction: ContextMenuCommandInteraction): Promise<void> {
    const channelId = process.env.BAN_LOG_CHANNEL || '';
    if (!channelId) {
        throw new Error("BAN_LOG_CHANNEL environment variable is not set.");
    }

    await handleSanctionCommandRequest({ 
        interaction, 
        target, 
        type: 'ban', 
        channelId, 
        title: '서버 차단' 
    });
}

export default {
    info: new ContextMenuCommandBuilder()
        .setName("서버 차단")
        .setType(ApplicationCommandType.User),
    handler,
}