import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ChatInputCommandInteraction,
	EmbedBuilder
} from 'discord.js';

import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
	description: 'View your detective profile.'
})
export class ProfileCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('profile')
				.setDescription('View your detective profile.')
		);
	}

	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	) {
		const file = path.join(
			process.cwd(),
			'src',
			'data',
			'players.json'
		);

		const data = JSON.parse(fs.readFileSync(file, 'utf8'));

		// Nếu chưa có profile
		if (!data[interaction.user.id]) {
			data[interaction.user.id] = {
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

			fs.writeFileSync(
				file,
				JSON.stringify(data, null, 2)
			);
		}

		const player = data[interaction.user.id];

		// Accuracy tự tính
		const totalAnswers =
			player.correct + player.wrong;

		const accuracy =
			totalAnswers === 0
				? 0
				: Math.round(
						(player.correct / totalAnswers) *
							100
				  );

		// Rank
		let rank = 'Rookie Detective';

		if (player.level >= 10)
			rank = 'Junior Detective';

		if (player.level >= 20)
			rank = 'Senior Detective';

		if (player.level >= 35)
			rank = 'Lead Detective';

		if (player.level >= 50)
			rank = 'Master Detective';

		const embed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle('🕵️ Detective Profile')
			.setThumbnail(
				interaction.user.displayAvatarURL()
			)
			.addFields(
				{
					name: '👤 Detective',
					value: interaction.user.username,
					inline: true
				},
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
					name: '📂 Cases Solved',
					value: `${player.casesSolved}`,
					inline: true
				},
				{
					name: '📝 Cases Published',
					value: `${player.casesPublished}`,
					inline: true
				},
				{
					name: '🎯 Accuracy',
					value: `${accuracy}%`,
					inline: true
				},
				{
					name: '🤝 Trust',
					value: player.trust,
					inline: true
				},
				{
					name: '✅ Correct',
					value: `${player.correct}`,
					inline: true
				},
				{
					name: '❌ Wrong',
					value: `${player.wrong}`,
					inline: true
				},
				{
					name: '🏆 Rank',
					value: rank,
					inline: true
				},
				{
					name: '💬 Motto',
					value:
						'*"Every clue tells a story."*'
				}
			)
			.setTimestamp();

		await interaction.reply({
			embeds: [embed]
		});
	}
}