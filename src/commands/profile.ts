import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder
} from 'discord.js';

import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
	description: 'View a detective profile.'
})
export class ProfileCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('profile')
				.setDescription('View a detective profile.')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription(
							'View another detective profile.'
						)
						.setRequired(false)
				)
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

		// Tạo players.json nếu chưa có
		if (!fs.existsSync(file)) {
			fs.mkdirSync(path.dirname(file), {
				recursive: true
			});

			fs.writeFileSync(file, '{}');
		}

		let data: Record<string, any> = {};

		try {
			const raw = fs
				.readFileSync(file, 'utf8')
				.trim();

			data = raw ? JSON.parse(raw) : {};
		} catch {
			data = {};
		}

		// Người được xem profile
		const targetUser =
			interaction.options.getUser('user') ??
			interaction.user;

		const userId = targetUser.id;

		// Tạo profile nếu người này chưa có
		if (!data[userId]) {
			data[userId] = {
				role: 'detective',
				level: 1,
				exp: 0,
				trust: 'Low',
				casesSolved: 0,
				casesPublished: 0,
				correct: 0,
				wrong: 0,
				streak: 0,
				badges: []
			};

			fs.writeFileSync(
				file,
				JSON.stringify(data, null, 2)
			);
		}

		const player = data[userId];

		// Đảm bảo profile cũ có đủ dữ liệu
		player.level ??= 1;
		player.exp ??= 0;
		player.trust ??= 'Low';
		player.casesSolved ??= 0;
		player.correct ??= 0;
		player.wrong ??= 0;
		player.streak ??= 0;
		player.badges ??= [];

		// Accuracy
		const totalAnswers =
			player.correct + player.wrong;

		const accuracy =
			totalAnswers === 0
				? 0
				: Math.round(
						(player.correct /
							totalAnswers) *
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

		// Reputation
		let reputation = '★☆☆☆☆';

		if (player.trust === 'Medium') {
			reputation = '★★★☆☆';
		}

		if (player.trust === 'High') {
			reputation = '★★★★★';
		}

		// Nếu trust đang là số thì dùng luôn số đó
		if (typeof player.trust === 'number') {
			const stars = Math.max(
				0,
				Math.min(5, player.trust)
			);

			reputation =
				'★'.repeat(stars) +
				'☆'.repeat(5 - stars);
		}

		const embed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle(
				`🕵️ ${targetUser.username}'s Profile`
			)
			.setThumbnail(
				targetUser.displayAvatarURL({
					size: 256
				})
			)
			.addFields(
				{
					name: '🕵️ Detective',
					value: targetUser.username,
					inline: true
				},
				{
					name: '⭐ Level',
					value: `${player.level}`,
					inline: true
				},
				{
					name: '📈 EXP',
					value: `${player.exp}/100`,
					inline: true
				},
				{
					name: '📁 Solved Cases',
					value: `${player.casesSolved}`,
					inline: true
				},
				{
					name: '🎯 Accuracy',
					value: `${accuracy}%`,
					inline: true
				},
				{
					name: '🔥 Win Streak',
					value: `${player.streak}`,
					inline: true
				},
				{
					name: '🏆 Reputation',
					value: reputation,
					inline: true
				},
				{
					name: '🏅 Rank',
					value: rank,
					inline: true
				},
				{
					name: '💬 Motto',
					value:
						'*"Do you smell the scent of blood, or the stench of sin?"*'
				}
			)
			.setTimestamp();

		const badgesButton = new ButtonBuilder()
			.setCustomId(
				`profile_badges_${userId}`
			)
			.setLabel('Huy hiệu')
			.setEmoji('🏅')
			.setStyle(ButtonStyle.Secondary);

		const row =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				badgesButton
			);

		await interaction.reply({
			embeds: [embed],
			components: [row]
		});
	}
}