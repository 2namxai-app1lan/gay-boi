import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	Message
} from 'discord.js';

import fs from 'fs';
import path from 'path';

// Thời gian cooldown: 120 ngày tính bằng miligiây
const COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;

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

		if (!data[userId]) {
			data[userId] = {
				job: 'Unemployed',
				level: 1,
				exp: 0,
				dishesCooked: 0,
				inventory: { meat: 5, veggie: 5, spice: 5 },
				lastJobChange: 0
			};
		}

		const player = data[userId];
		const now = Date.now();

	 		// Nếu đã có job (khác Unemployed)
		if (player.job && player.job !== 'Unemployed') {
			// Nếu chưa có lastJobChange (dữ liệu cũ), gán tạm thời điểm hiện tại cho họ
			if (!player.lastJobChange) {
				player.lastJobChange = now;
				fs.writeFileSync(file, JSON.stringify(data, null, 2));
			}

			const timePassed = now - player.lastJobChange;
			if (timePassed < COOLDOWN_MS) {
				const remainingDays = Math.ceil((COOLDOWN_MS - timePassed) / (24 * 60 * 60 * 1000));
				await message.reply(
					`⏳ **Bạn đang trong hợp đồng làm việc!**\nChức vụ hiện tại của bạn: **${player.job.toUpperCase()}**.\nBạn cần đợi thêm **${remainingDays} ngày** nữa (đủ 4 tháng) mới có thể xin chuyển sang vị trí khác tại nhà hàng "Hết Khô Gà" 🐔❌.`
				);
				return;
			}
		}
