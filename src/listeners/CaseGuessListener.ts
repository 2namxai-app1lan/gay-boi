import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: 'interactionCreate'
})
export class CaseGuessListener extends Listener {
	public override async run(interaction: Interaction): Promise<void> {
		if (!interaction.isButton()) return;

		console.log('BUTTON CLICKED:', interaction.customId);

		if (interaction.replied || interaction.deferred) return;

		const id = interaction.customId;

		if (id === 'guess_canter') {
			await interaction.reply({
				content: '❌ Incorrect!\nReason: Canter has a solid alibi.',
				ephemeral: true
			});
			return;
		}

		if (id === 'guess_halen') {
			await interaction.reply({
				content: '❌ Incorrect!\nReason: Halen was not near the scene.',
				ephemeral: true
			});
			return;
		}

		if (id === 'guess_lololele') {
			await interaction.reply({
				content: '✅ Correct!\nReason: Evidence points to Lololele.',
				ephemeral: true
			});
			return;
		}
	}
}
