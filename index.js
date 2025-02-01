const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');

const client = new Discord.Client({
    partials: [Discord.Partials.MESSAGE, Discord.Partials.CHANNEL, Discord.Partials.GUILD_MEMBER],
    intents: [Discord.IntentsBitField.Flags.Guilds, Discord.IntentsBitField.Flags.GuildMessages, Discord.IntentsBitField.Flags.GuildMembers, Discord.IntentsBitField.Flags.MessageContent],
});

client.on('ready', () => {
    console.log(`Ready. Logged as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;

    if (message.channel.id === process.env.ADD_BOT_CHANNEL_ID) {
        const [clientIDLine, sourceCodeLine] = message.content.split('\n');
        const wrongFormat = (reason) => {
            message.delete();
            message.author.send(`Your request is not in the right format. Please retry. Reason: ${reason}`);
        };
        if (!clientIDLine || !sourceCodeLine) return wrongFormat('cannot parse message');
        const clientID = clientIDLine.slice('Client ID:'.length, clientIDLine.length).trim();
        if (!clientID || !(/^([0-9]{1,32})$/.test(clientID))) return wrongFormat('client ID not found');
        const sourceCode = sourceCodeLine.slice('Source code URL:'.length, sourceCodeLine.length).trim();
        if (!sourceCode) return wrongFormat('source code not found');
        const user = await client.users.fetch(clientID).catch(() => {});
        if (!user) return wrongFormat('user not found');
        const embed = new Discord.MessageEmbed()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setDescription(`**ID:** ${user.id}\n**Creation Date**: ${user.createdAt.toString()}\n**Source code**: <${sourceCode}>\n**Invite**: [Click here](https://discord.com/oauth2/authorize?client_id=${clientID}&permissions=0&scope=bot)\n**Author**: ${message.author.tag} (${message.author})`)
            .setColor('RED')
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL());
        message.delete();
        message.channel.send({ embeds: [embed] });
    } else if (
        /s4d|scratch/i.test(message.content) && message.channel.id !== process.env.S4D_CHANNEL_ID
    ) {
        message.channel.send({
            content: `your message seems to be related to <#${process.env.S4D_CHANNEL_ID}>. In this case, please use this channel instead.`,
            reply: {
                messageReference: message.id,
            },
        });
    } else if (
        /help|please/i.test(message.content) && process.env.CHAT_CHANNEL_IDS.split(',').includes(message.channel.id)
    ) {
        message.channel.send({
            content: `your message seems to be a request for help. In this case, please use <#${process.env.GENERAL_SUPPORT_CHANNEL_ID}> instead.`,
            reply: {
                messageReference: message.id,
            },
        });
    }
});

client.on('guildMemberAdd', (member) => {
    if (member.user.bot) {
        member.roles.add(member.guild.roles.cache.find(((role) => role.name === 'Bots')));

        const addBotChannel = client.channels.cache.get(process.env.ADD_BOT_CHANNEL_ID);
        addBotChannel.messages.fetch().then((messages) => {
            const addMessage = messages.some((m) => m.embeds[0]?.description.startsWith(`**ID:** ${member.user.id}`));
            if (addMessage) addMessage.delete();
        });
    } else {
        member.roles.add(member.guild.roles.cache.find((role) => role.name === 'Members'));
    }
    member.guild.channels.cache.find((ch) => ch.name === 'welcome').send(`:flag_gb: Welcome, ${member}! This is the AndrozDev server. This server is dedicated to help for projects created and/or maintained by **Androz#2091**. **Github**: <https://github.com/Androz2091>!\n\n:flag_fr: Bienvenue, ${member} ! Ceci est le serveur AndrozDev. Ce serveur est dédié à l'aide pour les packages créés et projets maintenus par **Androz#2091**.\n**Github**: **https://github.com/Androz2091** !`);
});

client.login(process.env.DISCORD_CLIENT_TOKEN);
