import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
	defaultPrefix: '!',
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages
	]
});

client.once('ready', () => {
	console.log('🟢 CLIENT READY');
	console.log(`BOT USER: ${client.user?.tag}`);
	console.log(`BOT ID: ${client.user?.id}`);
});

// ⚠️ quan trọng: token lấy từ Railway Variables
client.login(process.env.TOKEN);

