const Discord = require('discord.js');

const client = new Discord.Client({
    partials: [Discord.Partials.MESSAGE, Discord.Partials.CHANNEL, Discord.Partials.GUILD_MEMBER],
    intents: [Discord.IntentsBitField.Flags.Guilds, Discord.IntentsBitField.Flags.GuildMessages, Discord.IntentsBitField.Flags.GuildMembers, Discord.IntentsBitField.Flags.MessageContent],
});
const config = require('./config');

client.on('ready', () => {
    console.log(`Ready. Logged as ${client.user.tag}`);

    client.guilds.cache.get('558328638911545423').members.fetch()
    .then(members => {
        const notMembers = members.filter(member => !member.user.bot && !member.roles.cache.some(role => role.name === 'Members'));
        console.log(`Members without role: ${notMembers.size}`);

        notMembers.forEach(member => {
            member.roles.add(client.guilds.cache.get('558328638911545423').roles.cache.find(role => role.name === 'Members'))
            .then(() => console.log(`Added role to ${member.user.tag}`))
            .catch(console.error);
        });
    });
});

client.login(config.token);
