const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config");

client.on("ready", () => {
    console.log("Ready. Logged as "+client.user.tag);
});

client.on("guildMemberAdd", (member) => {
    if(member.user.bot){
        member.addRole(member.guild.roles.find((role => role.name === "Bots")));
    } else {
        member.addRole(member.guild.roles.find((role) => role.name === "Members"));
    }
    member.guild.channels.find((ch) => ch.name === "chat").send(`:flag_gb: Welcome, ${member}! This is the AndrozDev server. This server is dedicated to help for projects created and/or maintained by <@422820341791064085>. **Github**: https://github.com/Androz2091!\n\n:flag_fr: Bienvenue, ${member} ! Ceci est le serveur AndrozDev. Ce serveur est dédié à l'aide pour les packages créés et projets maintenu par <@422820341791064085>.\n**Github**: **https://github.com/Androz2091** !`)
});

client.login(config.token);
