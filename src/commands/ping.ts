import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'ping',
	description: 'Check bot latency.'
})
export class PingCommand extends Command {
	public override async messageRun(message: Message) {
		// Gửi tin nhắn tạm thời để tính độ trễ
		const msg = await message.reply('Ping? 🏓');

		const pingLatency = msg.createdTimestamp - message.createdTimestamp;
		const apiLatency = Math.round(this.container.client.ws.ping);

		// Cập nhật lại tin nhắn với kết quả độ trễ
		return msg.edit(
			`🏓 Pong!\n• **Độ trễ phản hồi (API):** \`${pingLatency}ms\`\n• **Độ trễ WebSocket:** \`${apiLatency}ms\``
		);
	}
}
