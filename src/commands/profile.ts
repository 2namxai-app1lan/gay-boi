import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
	name: 'profile',
	aliases: ['p', 'me', 'mprofile'],
	description: 'Display player profile and job details at "Hết Khô Gà" Restaurant.'
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

		const userId = message.author.id;

		// Khởi tạo dữ liệu người chơi mới nếu chưa có
		if (!data[userId]) {
			data[userId] = {
				job: 'Unemployed',
				level: 1,
				exp: 0,
				dishesCooked: 0,
				tablesServed: 0,
				guestsWelcomed: 0,
				inventory: { meat: 5, veggie: 5, spice: 5 },
				lastJobChange: 0
			};
			fs.writeFileSync(file, JSON.stringify(data, null, 2));
		}

		const player = data[userId];

		// Xử lý thông tin hiển thị riêng cho từng Job
		let jobTitle = '❌ Chưa có việc làm (Unemployed)';
		let jobDetailsField = { name: '', value: '' };

		if (player.job === 'chef') {
			jobTitle = '🍳 Chef (Đầu Bếp)';
			jobDetailsField = {
				name: '📦 Thông Tin Đầu Bếp',
				value: `🥩 **Thịt:** ${player.inventory?.meat || 0}\n🥦 **Rau:** ${player.inventory?.veggie || 0}\n🧂 **Gia vị:** ${player.inventory?.spice || 0}\n🍲 **Món đã nấu:** ${player.dishesCooked || 0}\n\n💡 *Lệnh công việc:* \`mcook\``
			};
		} else if (player.job === 'waiter') {
			jobTitle = '🍵 Waiter (Bồi Bàn)';
			jobDetailsField = {
				name: '🧹 Thông Tin Bồi Bàn',
				value: `🧽 **Bàn đã phục vụ:** ${player.tablesServed || 0}\n\n💡 *Lệnh công việc:* \`mserve\``
			};
		} else if (player.job === 'receptionist') {
			jobTitle = '📋 Receptionist (Lễ Tân)';
			jobDetailsField = {
				name: '👥 Thông Tin Lễ Tân',
				value: `🛎️ **Khách đã tiếp đón:** ${player.guestsWelcomed || 0}\n\n💡 *Lệnh công việc:* \`mwork\``
			};
		} else {
			jobDetailsField = {
				name: '📢 Hướng Dẫn',
				value: 'Dùng lệnh `mjob` để chọn vị trí làm việc tại nhà hàng "Hết Khô Gà" 🐔❌!'
			};
		}

		const embed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle(`📜 Hồ Sơ Nhân Viên - ${message.author.username}`)
			.setThumbnail(message.author.displayAvatarURL({ forceStatic: false }))
			.addFields(
				{ name: '💼 Vị Trí', value: jobTitle, inline: true },
				{ name: '⭐ Cấp Độ', value: `Level ${player.level || 1} (${player.exp || 0} EXP)`, inline: true },
				jobDetailsField
			)
			.setFooter({ text: 'Nhà hàng "Hết Khô Gà" 🐔❌ - Cùng nhau phát triển!' })
			.setTimestamp();

		await message.reply({ embeds: [embed] });
	}
}
