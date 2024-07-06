import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Logger from "../../lib/logger";

const logger = new Logger();

async function handle(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString("종류");
    if(!type) logger.error("Push Modal Command Type is not provided");

    switch(type) {
        case "welcome_modal":
            logger.info("Welcome Modal");
            break;
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
    ),
    handle
}