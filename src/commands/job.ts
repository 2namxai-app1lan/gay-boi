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
	name: 'job',
	aliases: ['xinviec'],
	description: 'Apply for a job at "Hết Khô Gà" Restaurant.'
})
export class JobCommand extends Command {
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

		const userId = message.author.id;

		// Khởi tạo dữ liệu người chơi nếu chưa có
		if (!data[userId]) {
			data[userId] = {
				job: null,
				level: 1,
				exp: 0
			};
		}

		// Bảng giới thiệu công việc (Tutorial Embed)
		const embed = new EmbedBuilder()
			.setColor('#FEE75C')
			.setTitle('🏪 "Hết Khô Gà" Restaurant Recruitment')
			.setDescription(
				'Welcome to **"Hết Khô Gà" Restaurant**! 🐔❌\nChoose your position below to start working:'
			)
			.addFields(
				{
					name: '🍵 Waiter (Bồi Bàn)',
					value: 'Serve customers and clean tables.',
					inline: true
				},
				{
					name: '🍳 Chef (Đầu Bếp)',
					value: 'Cook delicious meals according to orders.',
					inline: true
				},
				{
					name: '📋 Receptionist (Lễ Tân)',
					value: 'Welcome guests and manage reservations.',
					inline: true
				}
			)
			.setFooter({ text: 'Click a button below to select your job!' });

		// Các nút bấm chọn công việc
		const waiterBtn = new ButtonBuilder()
			.setCustomId(`job_select_waiter_${userId}`)
			.setLabel('Waiter')
			.setEmoji('🍵')
			.setStyle(ButtonStyle.Primary);

		const chefBtn = new ButtonBuilder()
			.setCustomId(`job_select_chef_${userId}`)
			.setLabel('Chef')
			.setEmoji('🍳')
			.setStyle(ButtonStyle.Success);

		const recBtn = new ButtonBuilder()
			.setCustomId(`job_select_rec_${userId}`)
			.setLabel('Receptionist')
			.setEmoji('📋')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			waiterBtn,
			chefBtn,
			recBtn
		);

		await message.reply({
			embeds: [embed],
			components: [row]
		});
	}
}
