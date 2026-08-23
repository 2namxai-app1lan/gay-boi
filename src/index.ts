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

client.login('YOUR_BOT_TOKEN');
