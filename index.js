const Discord = require("discord.js");
const client = new Discord.Client({
    partials: [ "MESSAGE", "CHANNEL", "REACTION" ],
    fetchAllMembers: true
});
const config = require("./config");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: config.githubToken
});

let projects = [];

const reload = async (force = false) => {
    const descriptionMessage = (await client.channels.cache.get(config.notifDescriptionChannel).messages.fetch()).first();
    projects = descriptionMessage.content.split('\n').map((projectData) => {
        const [ github, channel ] = projectData.split(', ');
        const githubSeq = github.split('/')
        return {
            repo: githubSeq.pop(),
            owner: githubSeq.pop(),
            channelID: channel.split('<#')[1].split('>')[0]
        }
    });

    const notificationChannel = client.channels.cache.get(config.notifChannel)
    let notificationMessages = await notificationChannel.messages.fetch();
    if (force) {
        notificationChannel.bulkDelete(notificationMessages);
        notificationMessages = new Discord.Collection()
    }
    if (notificationMessages.size === 0){
        notificationChannel.send('wait').then((m) => {
            m.edit(`@everyone, react to :bell: under the name of the packages/projects you like, and you will receive notifications!\n** **`)
        })
    }
    for(const project of projects){
        const { data: { description } } = await octokit.repos.get({
            repo: project.repo,
            owner: project.owner
        });
        const role = notificationChannel.guild.roles.cache.find((role) => role.name === `${project.repo} notifications`) || await notificationChannel.guild.roles.create({
            data: {
                name: `${project.repo} notifications`,
                color: 'BLUE',
                mentionable: false,
                hoist: false
            }
        })
        const messageContent = `** **\n<#${project.channelID}> || || ${description}`
        const messageContentEdit = `** **\n<#${project.channelID}> ||${role.toString()}|| ${description} | :bell: **${descriptionMessage.guild.members.cache.filter((m) => m.roles.cache.some((r) => r.name === `${project.repo} notifications`)).size}** subscriptions`
        const exists = notificationMessages.some((m) => m.content === messageContentEdit);
        if(!exists){
            const oldVersion = notificationMessages.find((m) => m.mentions.channels.first().id === project.channelID);
            if(oldVersion) oldVersion.delete();
            notificationChannel.send(messageContent).then((m) => {
                m.edit(messageContentEdit);
                m.react('🔔');
            })
        }
    }
}

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.emoji.name === '🔔' && reaction.message.channel.id === config.notifChannel && user.id !== client.user.id) {
        const project = projects.find((p) => p.channelID === reaction.message.mentions.channels.first().id);
        if (!project) return
        const role = reaction.message.guild.roles.cache.find((role) => role.name === `${project.repo} notifications`)
        const member = await reaction.message.guild.members.fetch(user.id);
        member.roles.add(role);
        user.send(`:white_check_mark: You have been added to the ${reaction.message.mentions.channels.first().toString()} subscriptions list. Use <#${config.notifChannel}> to unsubscribe.`)
        const { data: { description } } = await octokit.repos.get({
            repo: project.repo,
            owner: project.owner
        });
        const messageContentEdit = `** **\n<#${project.channelID}> ||${role.toString()}|| ${description} | :bell: **${reaction.message.guild.members.cache.filter((m) => m.roles.cache.some((r) => r.name === `${project.repo} notifications`)).size}** subscriptions`;
        reaction.message.edit(messageContentEdit)
    }
})

client.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.emoji.name === '🔔' && reaction.message.channel.id === config.notifChannel && user.id !== client.user.id) {
        const project = projects.find((p) => p.channelID === reaction.message.mentions.channels.first().id);
        if (!project) return
        const role = reaction.message.guild.roles.cache.find((role) => role.name === `${project.repo} notifications`)
        const member = await reaction.message.guild.members.fetch(user.id);
        member.roles.remove(role);
        user.send(`:white_check_mark: You have been removed from the ${reaction.message.mentions.channels.first().toString()} subscriptions list. Use <#${config.notifChannel}> to subscribe again.`)
        const { data: { description } } = await octokit.repos.get({
            repo: project.repo,
            owner: project.owner
        });
        const messageContentEdit = `** **\n<#${project.channelID}> ||${role.toString()}|| ${description} | :bell: **${reaction.message.guild.members.cache.filter((m) => m.roles.cache.some((r) => r.name === `${project.repo} notifications`)).size}** subscriptions`;
        reaction.message.edit(messageContentEdit)
    }
});

client.on("ready", () => {
    console.log("Ready. Logged as "+client.user.tag);
    reload();
});

client.on('message', async (message) => {
    if(message.channel.type === 'dm') return;
    if(message.guild.ownerID === message.author.id) {
        if(message.content === '!reload') reload();
        else if (message.content === '!!reload') reload(true)
    }   
  var badWords = ['enculé', 'e n c u l é', 'encule', 'e n c u l e', 'enculer', 'e n c u l e r']
  let foundInText = false;
  for (var i in badWords) {
    if (message.content.toLowerCase().includes(badWords[i].toLowerCase())) foundInText = true;
  }
  if (foundInText) {
    message.delete();
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
    member.guild.channels.cache.find((ch) => ch.name === "chat").send(`:flag_gb: Welcome, ${member}! This is the AndrozDev server. This server is dedicated to help for projects created and/or maintained by <@422820341791064085>. **Github**: <https://github.com/Androz2091>!\n\n:flag_fr: Bienvenue, ${member} ! Ceci est le serveur AndrozDev. Ce serveur est dédié à l'aide pour les packages créés et projets maintenus par <@422820341791064085>.\n**Github**: **https://github.com/Androz2091** !`)
});

client.login(config.token);
