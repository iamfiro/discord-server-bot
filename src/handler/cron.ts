import { CronJob } from "cron";
import Logger from "../lib/logger";
import handleAfkUser from "./handleAfkUser";

const logger = new Logger();

/**
* Schedule a cron job to run the handleAfkUser function every day at midnight
*/
export const handleAfkJob = new CronJob("0 0 * * *", async () => {
   logger.info('Starting handleAfkUser cron job...');
   try {
       await handleAfkUser();
       logger.info('Completed handleAfkUser cron job.');
   } catch (error) {
       logger.error(`Error during handleAfkUser cron job: ${error}`);
   }
});