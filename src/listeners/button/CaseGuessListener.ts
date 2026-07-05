import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: 'interactionCreate'
})
export class CaseGuessListener extends Listener {
	public override async run(interaction: Interaction): Promise<void> {
		if (!interaction.isButton()) return;

		const id = interaction.customId;

		if (id === 'guess_canter') {
			await interaction.reply({
				content:
					'❌ Incorrect!\n\nReason: Canter was seen washing hands during the incident.',
				ephemeral: true
			});
			return;
		}

		if (id === 'guess_halen') {
			await interaction.reply({
				content:
					'❌ Incorrect!\n\nReason: Halen has a verified alibi.',
				ephemeral: true
			});
			return;
		}

		if (id === 'guess_lololele') {
			await interaction.reply({
				content:
					'✅ Correct!\n\nReason: Security footage shows suspicious activity near the restroom.',
				ephemeral: true
			});
			return;
		}
	}
}