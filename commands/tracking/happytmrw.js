const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const streaks = require("../../data/streaks.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("happytmrw")
        .setDescription("Simulate the next day"),
    async execute(interaction) {
        await streaks.newDay();
        interaction.reply({content: "done!", flags: MessageFlags.Ephemeral});
    }
}