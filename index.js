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
    member.guild.channels.find((ch) => ch.name === "chat").send(`:flag_gb: Welcome, ${member}! This is the AndrozDev server. It's a server that is primarily about the Androz's bots and packages. You can check out his projects on GitHub at https://github.com/Androz2091!\n\n:flag_fr: Bienvenue, ${member} ! Ceci est le serveur AndrozDev. C'est un serveur qui est orienté principalement vers les modules et les bots d'Androz. Vous pouvez découvrir ses projets sur GitHub https://github.com/Androz2091 !`)
});

client.login(config.token);
