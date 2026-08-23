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

		const targetUser = message.mentions.users.first() || message.author;
		const userId = targetUser.id;

		if (!data[userId]) {
			data[userId] = {
				job: 'Unemployed',
				level: 1,
				exp: 0,
				coins: 1000,
				dishesCooked: 0,
				tablesServed: 0,
				guestsWelcomed: 0,
				inventory: {
					meats: { chicken: 5, beef: 2, pork: 3, duck: 0 },
					veggies: { cabbage: 5, lettuce: 5, water_spinach: 3, garland_chrysanthemum: 0 },
					spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 }
				},
				lastJobChange: 0
			};
			fs.writeFileSync(file, JSON.stringify(data, null, 2));
		}

		const player = data[userId];

		let jobTitle = '❌ Chưa có việc làm (Unemployed)';
		let jobDetailsField = { name: '', value: '' };

		if (player.job === 'chef') {
			jobTitle = '🍳 Chef (Đầu Bếp)';
			
			const meats = player.inventory?.meats || {};
			const veggies = player.inventory?.veggies || {};
			const spices = player.inventory?.spices || {};

			const totalMeat = Object.values(meats).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
			const totalVeggie = Object.values(veggies).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
			const totalSpice = Object.values(spices).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

			jobDetailsField = {
				name: '📦 Thông Tin Đầu Bếp',
				value: `🥩 **Tổng Thịt:** ${totalMeat}\n🥦 **Tổng Rau:** ${totalVeggie}\n🧂 **Tổng Gia vị:** ${totalSpice}\n🍲 **Món đã nấu:** ${player.dishesCooked || 0}\n\n💡 *Lệnh công việc:* \`mcook\``
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
			.setTitle(`📜 Hồ Sơ Nhân Viên - ${targetUser.username}`)
			.setThumbnail(targetUser.displayAvatarURL({ forceStatic: false }))
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
