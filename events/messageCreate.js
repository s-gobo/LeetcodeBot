const { Events } = require("discord.js");
const config = require("../config");
const streaks = require("../data/streaks");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.id === config.app.clientId) {
            return;
        }
        streaks.submission(message);
        if (config.settings.echoChannels[message.channelId]) {
            await message.reply(message.content != '' ? message.content : "empty message");
        }
    }
}