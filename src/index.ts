import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
	defaultPrefix: 'm',
	caseInsensitiveCommands: true,

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
		client.logger.info('Logging in');

		await client.login();

		client.logger.info('Logged in');

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
