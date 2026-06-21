import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Test command'
})
export class CaseCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'case',
			description: 'Test command'
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		return interaction.reply({
			content: `
📁 CASE #001

Nạn nhân: Mr. Duck
Địa điểm: Văn phòng
Hung khí: Cây thước của giáo viên

Ai là thủ phạm? 🤔
			`
		});
	}
}
