const { Events } = require('discord.js');
const config = require('../config');
const streaks = require('../data/streaks');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        config.init(client);
        streaks.init();
    },
};