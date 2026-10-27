const fs = require('node:fs/promises');
const config = require("../config");

module.exports = {
    async init() {},
    async submission(message) {
        if (!this.isSubmission(message)) {
            return;
        }
        await config.volatile.guilds[message.guildId].discussionChannel.send(message.url)
        config.streaks[message.guildId][message.author.id].hasSubmitted = true;
        config.backupStreaks();
    },
    async newDay() {
        for (const guildId in config.streaks) {
            let re = "Simulated new day\n\n";
            for (const userId in config.streaks[guildId]) {
                const userData = config.streaks[guildId][userId];
                if (userData.hasSubmitted) {
                    re += ":white_check_mark:";
                    userData.streak++;
                    userData.hasSubmitted = false;
                } else {
                    re += ":x:";
                    userData.streak = 0;
                }
                const {alias, streak} = userData;
                re += ` ${alias} — :fire: ${streak}\n`
            }
            await config.volatile.guilds[guildId].discussionChannel.send(re);
        }
        await backup();
    },
    isSubmission(message) {
        return config.settings.guilds[message.guildId]?.forum === message.channel.parentId &&
            (message.content.includes("```") || message.attachments.size > 0);
    },
    async backup() {
        await fs.writeFile(config.dev.streaksPath, JSON.stringify(config.streaks));
    },
}