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
    if(message.channel.type === 'dm') return;
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
