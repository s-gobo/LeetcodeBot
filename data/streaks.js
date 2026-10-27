const fs = require('node:fs/promises');
const config = require("../config");

module.exports = {
    async init() {
        const file = await fs.readFile(config.dev.streaksPath);
        const oldStreaks = JSON.parse(file.toString('utf8'));
        config.streaks = oldStreaks;
    },
    async submission(message) {
        if (!this.isSubmission(message)) {
            return;
        }
        await config.volatile.guilds[message.guildId].discussionChannel.send(message.url);
        const userData = config.streaks[message.guildId][message.author.id];
        userData.todaySubmissions.push({url: message.url})
        userData.totalSubmissions++;
        this.backup();
    },
    async newDay() {
        for (const guildId in config.streaks) {
            let re = "Simulated new day\n\n";
            for (const userId in config.streaks[guildId]) {
                const userData = config.streaks[guildId][userId];
                if (userData.todaySubmissions.length) {
                    re += ":white_check_mark:";
                    userData.streak++;
                    userData.todaySubmissions = [];
                    userData.totalSubmittedDays++;
                } else {
                    re += ":x:";
                    userData.streak = 0;
                }
                const alias = config.settings.guilds[guildId].people[userId];
                re += ` ${alias} — :fire: ${userData.streak} (${userData.totalSubmittedDays} days)\n`
            }
            await config.volatile.guilds[guildId].discussionChannel.send(re);
        }
        await this.backup();
    },
    isSubmission(message) {
        return config.settings.guilds[message.guildId]?.forum === message.channel.parentId &&
            (message.content.includes("```") || message.attachments.size > 0);
    },
    async backup() {
        await fs.writeFile(config.dev.streaksPath, JSON.stringify(config.streaks));
    },
}