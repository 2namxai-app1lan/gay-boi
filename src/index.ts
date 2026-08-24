import 'dotenv/config';
import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    defaultPrefix: 'M',
    caseInsensitivePrefixes: true,
    presence: {
        activities: [
            {
                name: 'Thiếu bã mía là mất khô gà 🐔',
                type: ActivityType.Playing
            }
        ],
        status: 'online'
    }
});

client.login(process.env.DISCORD_TOKEN);
