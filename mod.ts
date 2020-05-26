import Client from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v4/module/client.ts";
import { Intents } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v4/types/options.ts";
import { Message } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v4/structures/message.ts";
import { Member } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v4/structures/member.ts";
import { cache } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v4/utils/cache.ts";
import { token, botID } from "./config.ts";

const BotOptions = {
    token: token,
    botID: botID,
    intents: [Intents.GUILD_MESSAGES],
    eventHandlers: {
        ready: () => {
            console.log(`Logged!`);
        },
        messageCreate: (message: Message) => {
            if(message.content === "!dw-f"){
                message.channel.sendMessage(":zap: Pro tip: préférez envoyer une erreur plutôt que \"ça ne marche pas\". Cela permettra de trouver une solution à votre problème.");
            } else if(message.content === "!hn-f"){
                message.channel.sendMessage(":zap: Pro tip: préférez poser directement votre question plutôt que de demander si quelqu'un peut y répondre. Premièrement, parce que la personne ne sachant pas quelle est votre question elle ne pourra pas vous répondre et ensuite parce que dans tous les cas vous allez devoir l'envoyer. Vous gagnez du temps et nous aussi.");
            }
        },
        guildMemberAdd: (member: Member) => {
            const channel = Array.from(cache.channels.values()).find((channel) => channel.name === "chat");
            channel?.sendMessage(`:flag_gb: Welcome, ${member.mention}! This is the AndrozDev server. This server is dedicated to help for projects created and/or maintained by <@422820341791064085>. **Github**: **https://github.com/Androz2091**!\n\n:flag_fr: Bienvenue, ${member.mention} ! Ceci est le serveur AndrozDev. Ce serveur est dédié à l'aide pour les packages créés et projets maintenu par <@422820341791064085>.\n**Github**: https://github.com/Androz2091 !`);
            const botRole = Array.from(member.guild().roles.values()).find((role) => role.name === "Bots")?.id;
            const memberRole = Array.from(member.guild().roles.values()).find((role) => role.name === "Members")?.id;
            if(member.user.bot){
                if(botRole){
                    member.addRole(botRole);
                }
            } else {
                if(memberRole){
                    member.addRole(memberRole);
                }
            }
        }
    }
};

const client = await Client(BotOptions);
