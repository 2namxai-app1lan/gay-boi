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
	description: 'View chef profile and ingredient inventory.'
})
export class ProfileCommand extends Command {
	public override async messageRun(message: Message) {
		const file = path.join(
			process.cwd(),
			'src',
			'data',
			'players.json'
		);

		// Create players.json if it doesn't exist
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

		// Get mentioned user or default to message author
		const targetUser = message.mentions.users.first() ?? message.author;
		const userId = targetUser.id;

		// Check if user has the "Cái thớt" role in the server
		const member = message.guild?.members.cache.get(userId);
		const isCuttingBoard = member?.roles.cache.some(
			(role) => role.name.includes('Cái thớt')
		);

		// Initialize profile data if not present
		if (!data[userId]) {
			data[userId] = {
				level: 1,
				exp: 0,
				dishesCooked: 0,
				inventory: {
					meat: 5,   // 🥩 Meat
					veggie: 5, // 🥦 Veggies
					spice: 5   // 🧂 Spices
				}
			};

			fs.writeFileSync(file, JSON.stringify(data, null, 2));
		}

		const player = data[userId];

		// Ensure existing profiles have default values
		player.level ??= 1;
		player.exp ??= 0;
		player.dishesCooked ??= 0;
		player.inventory ??= { meat: 5, veggie: 5, spice: 5 };

		// Determine Chef Title
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
					inline: false
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
