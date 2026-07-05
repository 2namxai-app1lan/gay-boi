import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: 'interactionCreate'
})
export class CaseGuessListener extends Listener {
	public override async run(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return;

		if (interaction.customId === 'guess_canter') {
			return interaction.reply({
				content: '❌ Sai rồi! Canter không phải thủ phạm.',
				ephemeral: true
			});
		}

		if (interaction.customId === 'guess_halen') {
			return interaction.reply({
				content: '❌ Sai rồi! Halen vô tội.',
				ephemeral: true
			});
		}

		if (interaction.customId === 'guess_lololele') {
			return interaction.reply({
				content: '✅ ĐÚNG! Lololele là thủ phạm!',
				ephemeral: true
			});
		}

		return; // 👈 FIX lỗi 7030
	}
}