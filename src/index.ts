import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    defaultPrefix: 'M', // 👈 Đặt tiền tố mặc định là chữ 'M'
    caseInsensitivePrefixes: true, // 👈 Cho phép nhận diện cả 'm' viết thường
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

