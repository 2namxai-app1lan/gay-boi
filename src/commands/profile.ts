import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Message
} from 'discord.js';

import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
	name: 'profile',
	description: 'View chef profile, job, and ingredient inventory.'
})
export class ProfileCommand extends Command {
	public override async messageRun(message: Message) {
		const file = path.join(process.cwd(), 'src', 'data', 'players.json');

		if (!fs.existsSync(file)) {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, '{}');
		}

		let data: Record<string, any> = {};

		try {
			const raw = fs.readFileSync(file, 'utf8').trim();
			data = raw ? JSON.parse(raw) : {};
		} catch {
			data = {};
		}

		const targetUser = message.mentions.users.first() ?? message.author;
		const userId = targetUser.id;

		const member = message.guild?.members.cache.get(userId);
		const isCuttingBoard = member?.roles.cache.some((role) =>
			role.name.includes('Cái thớt')
		);

		if (!data[userId]) {
			data[userId] = {
				job: 'Unemployed', // Chưa có việc
				level: 1,
				exp: 0,
				dishesCooked: 0,
				inventory: { meat: 5, veggie: 5, spice: 5 }
			};

			fs.writeFileSync(file, JSON.stringify(data, null, 2));
		}

		const player = data[userId];

		player.job ??= 'Unemployed';
		player.level ??= 1;
		player.exp ??= 0;
		player.dishesCooked ??= 0;
		player.inventory ??= { meat: 5, veggie: 5, spice: 5 };

		// Tên hiển thị công việc
		const jobDisplayNames: Record<string, string> = {
			waiter: '🍵 Waiter (Bồi Bàn)',
			chef: '🍳 Chef (Đầu Bếp)',
			receptionist: '📋 Receptionist (Lễ Tân)',
			Unemployed: '❓ Unemployed (Chưa có việc)'
		};

		let chefTitle = '🧑‍🍳 Apprentice Chef';
		if (isCuttingBoard) {
			chefTitle = '👽 Supreme Judge "Cutting Board"';
		} else if (player.level >= 50) {
			chefTitle = '👑 Legendary Head Chef';
		} else if (player.level >= 30) {
			chefTitle = '🌟 Executive Chef';
		} else if (player.level >= 10) {
			chefTitle = '🍳 Sous Chef';
		}

		const embed = new EmbedBuilder()
			.setColor('#FF9900')
			.setTitle(`🍳 Kitchen Profile: ${targetUser.username}`)
			.setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
			.addFields(
				{
					name: '🎖️ Chef Title',
					value: chefTitle,
					inline: true
				},
				{
					name: '💼 Current Job',
					value: jobDisplayNames[player.job] || player.job,
					inline: true
				},
				{
					name: '⭐ Level',
					value: `Level ${player.level} (${player.exp}/100 EXP)`,
					inline: true
				},
				{
					name: '🍲 Dishes Cooked',
					value: `${player.dishesCooked} dishes`,
					inline: true
				},
				{
					name: '🧺 Ingredient Inventory',
					value: `🥩 **Meat:** ${player.inventory.meat}\n🥦 **Veggies:** ${player.inventory.veggie}\n🧂 **Spices:** ${player.inventory.spice}`,
					inline: false
				}
			)
			.setFooter({ text: 'Type mcook to start cooking!' })
			.setTimestamp();

		const cookButton = new ButtonBuilder()
			.setCustomId(`profile_cook_${userId}`)
			.setLabel('Start Cooking')
			.setEmoji('🍳')
			.setStyle(ButtonStyle.Success);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cookButton);

		await message.reply({
			embeds: [embed],
			components: [row]
		});
	}
}
