import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    // 🎮 Thử set trực tiếp presence tại đây:
    presence: {
        activities: [{
            name: 'Thiếu bã mía là mất khô gà 🐔',
            type: ActivityType.Playing
        }],
        status: 'online'
    }
});

client.login('MTUxMjEwMDE2MDg4MzM5MjU4Mw.G2JSiz.8OmxqnKkTRrSqPkx4B54i9XuEaHhab7n7rzAbc
');
