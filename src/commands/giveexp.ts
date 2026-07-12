import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits
} from 'discord.js';

import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
	description: 'Give EXP to a player.'
})
export class GiveExpCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('giveexp')
				.setDescription('Give EXP to a player')
				.setDefaultMemberPermissions(
					PermissionFlagsBits.Administrator
				)
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('Player')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('amount')
						.setDescription('Amount of EXP')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
	interaction: ChatInputCommandInteraction
) {
	try {
		const target = interaction.options.getUser('user', true);
		const amount = interaction.options.getInteger('amount', true);

		const file = path.join(
			process.cwd(),
			'src',
			'data',
			'players.json'
		);

		const data = JSON.parse(fs.readFileSync(file, 'utf8'));

		// Nếu chưa có profile
		if (!data[target.id]) {
			data[target.id] = {
				role: 'detective',
				level: 1,
				exp: 0,
				accuracy: 0,
				trust: 'Low',
				casesSolved: 0,
				casesPublished: 0,
				correct: 0,
				wrong: 0
			};
		}

		const player = data[target.id];

		const oldLevel = player.level;

		// Cộng EXP
		player.exp += amount;

		// Tính level
		player.level = Math.floor(player.exp / 100) + 1;

		const leveledUp = player.level > oldLevel;

		fs.writeFileSync(
			file,
			JSON.stringify(data, null, 2)
		);

		const embed = new EmbedBuilder()
			.setColor('#2ECC71')
			.setTitle('⭐ EXP Awarded')
			.setDescription(`${target} received **${amount} EXP!**`)
			.addFields(
				{
					name: '🕵️ Role',
					value: player.role,
					inline: true
				},
				{
					name: '⭐ Level',
					value: `${player.level}`,
					inline: true
				},
				{
					name: '📚 Total EXP',
					value: `${player.exp}`,
					inline: true
				},
				{
					name: '🎯 Accuracy',
					value: `${player.accuracy}%`,
					inline: true
				},
				{
					name: '🤝 Trust',
					value: player.trust,
					inline: true
				},
				{
					name: '📁 Cases Solved',
					value: `${player.casesSolved}`,
					inline: true
				}
			)
			.setTimestamp();

		if (leveledUp) {
			embed.addFields({
				name: '🎉 Level Up!',
				value: `${target} advanced to **Level ${player.level}**!`
			});
		}

		await interaction.reply({
			embeds: [embed]
		});
	} catch (error) {
		console.error('GiveExp Error:', error);

		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: '❌ An error occurred while executing this command.',
				ephemeral: true
			});
		}
	}
}

    }
