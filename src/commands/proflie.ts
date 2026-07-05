import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

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

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		// Temporary data (replace with database later)
		const level = 1;
		const exp = 0;
		const nextLevel = 100;
		const solvedCases = 0;
		const accuracy = '0%';
		const streak = 0;
		const reputation = '★☆☆☆☆';
		const rank = 'Rookie Detective';

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setTitle('🕵️ Detective Profile')
			.setThumbnail(interaction.user.displayAvatarURL())
			.addFields(
				{
					name: '👤 Detective',
					value: interaction.user.username,
					inline: true
				},
				{
					name: '⭐ Level',
					value: level.toString(),
					inline: true
				},
				{
					name: '📈 EXP',
					value: `${exp}/${nextLevel}`,
					inline: true
				},
				{
					name: '📂 Solved Cases',
					value: solvedCases.toString(),
					inline: true
				},
				{
					name: '🎯 Accuracy',
					value: accuracy,
					inline: true
				},
				{
					name: '🔥 Win Streak',
					value: streak.toString(),
					inline: true
				},
				{
					name: '🏆 Reputation',
					value: reputation,
					inline: true
				},
				{
					name: '🎖 Rank',
					value: rank,
					inline: true
				},
				{
					name: '💬 Motto',
					value: '*"Every clue tells a story."*'
				}
			)
			.setFooter({
				text: 'Solve cases to earn EXP and rank up!'
			})
			.setTimestamp();

		await interaction.reply({
			embeds: [embed]
		});
	}
}
