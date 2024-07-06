import { ButtonInteraction } from "discord.js";
import { client } from "../lib/bot";
import Logger from "../lib/logger";

const logger = new Logger();
const GUILD_ID = process.env.GUILD_ID || '';
const ROLE_ID = process.env.DEFAULT_ROLE_ID || '';

function handle(interaction: ButtonInteraction) {
    const user = client.users.cache.get(interaction.user.id);
    if (!user) logger.error("User not found");

    const guild = client.guilds.cache.get(GUILD_ID);   
    const member = guild?.members.cache.find((m) => m.id === interaction.user.id);

    member?.roles.add(ROLE_ID);

    logger.info(`Role added to ${member?.user.tag}`);

    interaction.reply({
        content: "역할이 추가되었습니다.",
        ephemeral: true
    });
}

export default {
    handle,
}