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
				inventory: { meat: 5, veggie: 5, spice: 5 }
			};
		}

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

		const waiterBtn = new ButtonBuilder()
			.setCustomId(`job_waiter_${userId}`)
			.setLabel('Waiter')
			.setEmoji('🍵')
			.setStyle(ButtonStyle.Primary);

		const chefBtn = new ButtonBuilder()
			.setCustomId(`job_chef_${userId}`)
			.setLabel('Chef')
			.setEmoji('🍳')
			.setStyle(ButtonStyle.Success);

		const recBtn = new ButtonBuilder()
			.setCustomId(`job_rec_${userId}`)
			.setLabel('Receptionist')
			.setEmoji('📋')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			waiterBtn,
			chefBtn,
			recBtn
		);

		const responseMessage = await message.reply({
			embeds: [embed],
			components: [row]
		});

		const collector = responseMessage.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id !== userId) {
				await interaction.reply({
					content: '❌ Single-player menu! Type `mjob` to open your own.',
					ephemeral: true
				});
				return;
			}

			let selectedJob = '';
			let roleName = '';

			if (interaction.customId === `job_waiter_${userId}`) {
				selectedJob = 'waiter';
				roleName = 'Waiter';
			} else if (interaction.customId === `job_chef_${userId}`) {
				selectedJob = 'chef';
				roleName = 'Chef';
			} else if (interaction.customId === `job_rec_${userId}`) {
				selectedJob = 'receptionist';
				roleName = 'Receptionist';
			}

			data[userId].job = selectedJob;
			fs.writeFileSync(file, JSON.stringify(data, null, 2));

			let roleMsg = '';
			const guildRole = interaction.guild?.roles.cache.find(
				(r) => r.name.toLowerCase() === roleName.toLowerCase()
			);

			if (guildRole) {
				const member = interaction.guild?.members.cache.get(userId);
				if (member) {
					await member.roles.add(guildRole).catch(() => null);
					roleMsg = `\n🎟️ **Discord Role Assigned:** <@&${guildRole.id}>`;
				}
			}

			const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				waiterBtn.setDisabled(true),
				chefBtn.setDisabled(true),
				recBtn.setDisabled(true)
			);

			await interaction.update({
				content: `🎉 **Congratulations!** You are now a **${roleName}** at "Hết Khô Gà" Restaurant! 🐔❌${roleMsg}\nType \`mprofile\` to check your profile.`,
				components: [disabledRow]
			});

			collector.stop();
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'time') {
				const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					waiterBtn.setDisabled(true),
					chefBtn.setDisabled(true),
					recBtn.setDisabled(true)
				);

				await responseMessage.edit({
					components: [disabledRow]
				}).catch(() => null);
			}
		});
	}
}
