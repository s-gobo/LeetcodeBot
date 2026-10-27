const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whodunit")
        .setDescription("See who make a submission today"),
    async execute(interaction) {
        if (config.volatile.guilds[interaction.guildId].discussionChannel.id != interaction.channelId) {
            await interaction.reply("Not the right channel!");
            return;
        }
        let re = "";
        for (const userId in config.streaks[interaction.guildId]) {
            const { hasSubmitted } = config.streaks[interaction.guildId][userId];
            const alias = config.settings.guilds[interaction.guildId].people[userId];
            re += `${alias} has ${hasSubmitted ? "" : "not "}submitted today!\n`;
        }
        await interaction.reply(re);
    }
}