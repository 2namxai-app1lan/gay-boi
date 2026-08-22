import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Thiết lập đường dẫn thư mục chuẩn cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new SapphireClient({
	defaultPrefix: 'm',
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,

	// 📁 Chỉ định thư mục gốc để Sapphire tự động quét thư mục commands/
	baseUserDirectory: __dirname,

	logger: {
		level: LogLevel.Debug
	},

	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages
	],

	loadMessageCommandListeners: true
});

async function main() {
	try {
		client.logger.info('Logging in...');
		await client.login();
		client.logger.info('Logged in successfully!');

		console.log('====================');
		console.log(`BOT USER: ${client.user?.tag}`);
		console.log(`BOT ID: ${client.user?.id}`);
		console.log('====================');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
}

void main();
