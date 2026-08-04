import { Listener } from '@sapphire/framework';
import {
	EmbedBuilder,
	Events,
	ButtonInteraction
} from 'discord.js';

import fs from 'fs';
import path from 'path';

export class ProfileBadgesListener extends Listener<
	typeof Events.InteractionCreate
> {
	public constructor(
		context: Listener.Context,
		options: Listener.Options
	) {
		super(context, {
			...options,
			event: Events.InteractionCreate
		});
	}

	public async run(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return;

		if (!interaction.customId.startsWith('profile_badges_')) {
			return;
		}

		const userId = interaction.customId.replace(
			'profile_badges_',
			''
		);

		const file = path.join(
			process.cwd(),
			'src',
			'data',
			'players.json'
		);

		if (!fs.existsSync(file)) {
			await interaction.reply({
				content: '❌ Không tìm thấy dữ liệu profile.',
				ephemeral: true
			});
			return;
		}

		let data: Record<string, any>;

		try {
			data = JSON.parse(
				fs.readFileSync(file, 'utf8')
			);
		} catch {
			await interaction.reply({
				content: '❌ Không đọc được dữ liệu profile.',
				ephemeral: true
			});
			return;
		}

		const player = data[userId];

		if (!player) {
			await interaction.reply({
				content: '❌ Profile này chưa tồn tại.',
				ephemeral: true
			});
			return;
		}

		const badges = Array.isArray(player.badges)
			? player.badges
			: [];

		const badgeText =
			badges.length > 0
				? badges.map((badge: string) => `🏅 ${badge}`).join('\n')
				: 'Chưa có huy hiệu nào. 😔';

		const embed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle('🏅 Detective Badges')
			.setDescription(badgeText)
			.setFooter({
				text: 'Case Investigation Bureau'
			})
			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}