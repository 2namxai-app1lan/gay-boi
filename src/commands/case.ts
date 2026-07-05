import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Open a detective case.'
})
export class CaseCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName('case').setDescription('Open Case #001')
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setColor('#E74C3C')
			.setTitle('📁 CASE FILE #001')
			.setDescription(
				'## 💥 THE EXPLODING TOILET\n━━━━━━━━━━━━━━━━━━━━━━\n**Status:** 🟢 Open Investigation'
			)
			.addFields(
				{
					name: '🚨 Incident Report',
					value:
						'At 14:36, a restroom was destroyed by an unknown explosion.'
				},
				{ name: '🚽 Victim', value: 'Toilet', inline: true },
				{ name: '📍 Location', value: 'School Restroom', inline: true },
				{ name: '🕒 Time', value: '14:36', inline: true },
				{
					name: '🔍 Evidence',
					value: '🦆 Rubber Duck\n🔌 Wire\n🧻 Wet Paper'
				},
				{
					name: '👤 Suspects',
					value:
						'**Canter:** wet hands\n**Halen:** normal\n**Lololele:** carrying cable'
				},
				{
					name: '🤔 Question',
					value: 'Who destroyed the toilet?'
				}
			)
			.setFooter({ text: 'Case Investigation Bureau' })
			.setTimestamp();

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('guess_canter')
				.setLabel('Canter')
				.setStyle(ButtonStyle.Primary),

			new ButtonBuilder()
				.setCustomId('guess_halen')
				.setLabel('Halen')
				.setStyle(ButtonStyle.Secondary),

			new ButtonBuilder()
				.setCustomId('guess_lololele')
				.setLabel('Lololele')
				.setStyle(ButtonStyle.Danger)
		);

		return interaction.reply({
			embeds: [embed],
			components: [row]
		});
	}
}