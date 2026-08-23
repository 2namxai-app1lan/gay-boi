import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
    name: 'help',
    aliases: ['mhelp', 'Mhelp'],
    description: 'Xem danh sách các lệnh của nhà hàng.'
})
export class HelpCommand extends Command {
    public override async messageRun(message: Message) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📜 Danh Sách Lệnh Nhà Hàng "Hết Khô Gà"')
            .setDescription('Dưới đây là các lệnh dành cho từng chức vụ trong nhà hàng 🍽️\n')
            .addFields(
                {
                    name: '👤 Lệnh Chung',
                    value: 
                        '• `mprofile`: Xem hồ sơ cá nhân & số tiền 💳\n' +
                        '• `mrecipe`: Xem sổ tay công thức nấu ăn 📖',
                    inline: false
                },
                {
                    name: '👨‍🍳 Nghề Bếp Trưởng (Chef)',
                    value: 
                        '• `mcook <mã món>`: Bắt đầu chế biến món ăn 🍳',
                    inline: false
                },
                {
                    name: '🤵 Nghề Bồi Bàn (Waiter)',
                    value: 
                        '• `mtakeorder`: Tiếp nhận đơn đặt món từ các bàn 📝\n' +
                        '• `mserve`: Bê món ăn đã cooked ra cho khách 🍽️\n' +
                        '• `mtips`: Nhận tiền tip thưởng từ khách 💵',
                    inline: false
                }
            )
            .setFooter({ text: '💡 Hãy chọn đúng công việc của mình để sử dụng lệnh nhé!' });

        await message.reply({ embeds: [helpEmbed] });
    }
}
