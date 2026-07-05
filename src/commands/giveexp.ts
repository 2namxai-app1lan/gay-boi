import { Command } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';
import fs from 'fs';

export class GiveExpCommand extends Command {
	public constructor(context: Command.LoaderContext) {
		super(context, {
			name: 'givexp',
			description: 'Cộng exp'
		});
	}

	public override registerApplicationCommands(
		registry: Command.Registry
	) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('givexp')
				.setDescription('Cộng EXP')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('Người chơi')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	) {
		const target =
			interaction.options.getUser('user', true);

		const data = JSON.parse(
			fs.readFileSync('./src/data/users.json', 'utf8')
		);

		if (!data[target.id]) {
			data[target.id] = {
				exp: 0,
				level: 1
			};
		}

		data[target.id].exp += 50;

		while (data[target.id].exp >= 100) {
			data[target.id].exp -= 100;
			data[target.id].level++;
		}

		fs.writeFileSync(
			'./src/data/users.json',
			JSON.stringify(data, null, 2)
		);

		await interaction.reply(
			`✅ ${target.username} nhận 50 EXP!
⭐ Level: ${data[target.id].level}
📚 EXP: ${data[target.id].exp}/100`
		);
	}
}
