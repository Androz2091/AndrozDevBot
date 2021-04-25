const Discord = require("discord.js");
const client = new Discord.Client({
    partials: [ "MESSAGE", "CHANNEL", "REACTION" ],
    fetchAllMembers: true
});
const config = require("./config");

client.on("ready", () => {
    console.log("Ready. Logged as "+client.user.tag);
});

client.on('message', async (message) => {
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;

    if (message.channel.id === config.addBotChannel) {
        const [clientIDLine, sourceCodeLine] = message.content.split('\n');
        const wrongFormat = (reason) => {
            message.delete();
            message.author.send('Your request is not in the right format. Please retry. Reason: ' + reason);
        }
        if (!clientIDLine || !sourceCodeLine) return wrongFormat('cannot parse message');
        const clientID = clientIDLine.slice('Client ID:'.length, clientIDLine.length).trim();
        if (!clientID || !(/^([0-9]{1,32})$/.test(clientID))) return wrongFormat('client ID not found');
        const sourceCode = sourceCodeLine.slice('Source code URL:'.length, sourceCodeLine.length).trim();
        if (!sourceCode) return wrongFormat('source code not found');
        const user = await client.users.fetch(clientID).catch(() => {});
        if (!user) return wrongFormat('user not found');
        const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.author.tag} wants to add ${user.tag}`, user.displayAvatarURL())
        .setDescription(`**Name:** ${user.tag}\n**Creation Date**: ${user.createdAt.toString()}\n**Source code**: <${sourceCode}>\n**Invite**: [Click here](https://discord.com/oauth2/authorize?client_id=${clientID}&permissions=8&scope=bot)\nAuthor mention: ${message.author}`)
        .setColor('RED')
        .setFooter(`ID: ${clientID}`);
        message.delete();
        message.channel.send(embed);
    }
})

client.on("guildMemberAdd", (member) => {
    if(member.user.bot){
        member.roles.add(member.guild.roles.cache.find((role => role.name === "Bots")));
    } else {
        member.roles.add(member.guild.roles.cache.find((role) => role.name === "Members"));
    }
    const whitelisted = config.whitelistedUsers.includes(member.user.id);
    if (whitelisted) return;
    member.guild.channels.cache.find((ch) => ch.name === "welcome").send(`:flag_gb: Welcome, ${member}! This is the AndrozDev server. This server is dedicated to help for projects created and/or maintained by <@422820341791064085>. **Github**: <https://github.com/Androz2091>!\n\n:flag_fr: Bienvenue, ${member} ! Ceci est le serveur AndrozDev. Ce serveur est dédié à l'aide pour les packages créés et projets maintenus par <@422820341791064085>.\n**Github**: **https://github.com/Androz2091** !`)
});

client.login(config.token);
