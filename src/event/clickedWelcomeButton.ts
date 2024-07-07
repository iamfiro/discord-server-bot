import { ButtonInteraction, GuildMember } from "discord.js";
import { client } from "../lib/bot";
import Logger from "../lib/logger";
import prisma from "../lib/prisma";

const logger = new Logger();
const GUILD_ID = process.env.GUILD_ID || '';
const ROLE_ID = process.env.DEFAULT_ROLE_ID || '';

/**
 * Handles the interaction when a button is clicked.
 * @param {ButtonInteraction} interaction - The interaction object from Discord.js
 */
async function handle(interaction: ButtonInteraction) {
    if (!GUILD_ID || !ROLE_ID) {
        logger.error("GUILD_ID or ROLE_ID is not set");
        return;
    }

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        logger.error("Guild not found");
        return;
    }

    const member = guild.members.cache.get(interaction.user.id);
    if (!member) {
        logger.error("Member not found");
        return;
    }

    try {
        await addRoleToMember(member);
        await upsertUserInDatabase(member);

        interaction.reply({
            content: "역할이 추가되었습니다.",
            ephemeral: true
        });
    } catch (error) {
        logger.error(`Error handling interaction: ${error}`);
        interaction.reply({
            content: "오류가 발생했습니다. 다시 시도해 주세요.",
            ephemeral: true
        });
    }
}

/**
 * Adds a role to a guild member.
 * @param {GuildMember} member - The guild member to whom the role will be added.
 */
async function addRoleToMember(member: GuildMember) {
    await member.roles.add(ROLE_ID);
    logger.info(`Role added to ${member.user.tag}`);
}

/**
 * Creates a user in the database.
 * @param {GuildMember} member - The guild member to be added to the database.
 */
async function upsertUserInDatabase(member: GuildMember) {
    await prisma.user.upsert({
        where: {
            userId: member.id,
        },
        update: {
            lastActivity: new Date(),
        },
        create: {
            userId: member.id,
            userName: member.user.username,
        }
    });
    logger.info(`User ${member.user.username} added to database`);
}

export default {
    handle,
}