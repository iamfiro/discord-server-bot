import { subWeeks } from "date-fns";
import prisma from "../lib/prisma";
import { client } from "../lib/bot";
import Logger from "../lib/logger";

const logger = new Logger();

/**
 * Handle AFK users by adding the AFK role to inactive members
 */
export default async function handleAfkUser(): Promise<void> {
    const GUILD_ID = process.env.GUILD_ID || '';
    const AFK_ROLE_ID = process.env.AFK_ROLE_ID || '';
    
    if (!GUILD_ID || !AFK_ROLE_ID) {
        logger.error('GUILD_ID or AFK_ROLE_ID is not defined.');
        return;
    }

    try {
        const allMembers = await prisma.user.findMany();
        const twoWeeksAgo = subWeeks(new Date(), 2);

        await Promise.all(
            allMembers.map(async (user) => {
                if (new Date(user.lastActivity) < twoWeeksAgo) {
                    await addAfkRoleToMember(user.userId, GUILD_ID, AFK_ROLE_ID);
                }
            })
        );
    } catch (error) {
        logger.error(`Error processing AFK users: ${error}`);
    }
}

/**
 * Add AFK role to a guild member if they are inactive
 * @param userId - The ID of the user to add the role to
 * @param guildId - The ID of the guild
 * @param afkRoleId - The ID of the AFK role
 */
async function addAfkRoleToMember(userId: string, guildId: string, afkRoleId: string): Promise<void> {
    const guild = client.guilds.cache.get(guildId);

    if (guild) {
        try {
            const member = await guild.members.fetch(userId);
            if (member) {
                await member.roles.add(afkRoleId);
                logger.info(`Added AFK role to ${member.user.tag}`);
            }
        } catch (error) {
            logger.error(`Error adding AFK role to ${userId}: ${error}`);
        }
    } else {
        logger.error(`Guild with ID ${guildId} not found`);
    }
}