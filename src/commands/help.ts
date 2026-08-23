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

@ApplyOptions<Command.Options>({
    name: 'help',
    aliases: ['mhelp', 'Mhelp'],
    description: 'Xem danh sách các lệnh của nhà hàng.'
})
export class HelpCommand extends Command {
    public override async messageRun(message: Message) {
        // 🏠 1. Embed Trang chủ (Tổng quan)
        const homeEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📜 Danh Sách Lệnh Nhà Hàng "Hết Khô Gà"')
            .setDescription(
                'Chào mừng bạn đến với hệ thống hỗ trợ! 🍽️\n' +
                'Hãy bấm vào các nút bên dưới để xem danh sách lệnh dành riêng cho từng vị trí làm việc.\n\n' +
                '• **👤 Lệnh Chung:** Lệnh cơ bản ai cũng dùng được.\n' +
                '• **👨‍🍳 Bếp Trưởng:** Các lệnh liên quan đến nấu nướng.\n' +
                '• **🤵 Bồi Bàn:** Các lệnh phục vụ & nhận đơn.\n' +
                '• **🛎️ Tiếp Tân:** Các lệnh đón khách & xếp bàn.'
            )
            .setFooter({ text: '💡 Chỉ người gõ mhelp mới có thể tương tác với nút bấm!' });

        // 🎛️ 2. Hàng nút bấm phân loại
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('help_general').setLabel('👤 Lệnh Chung').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('help_chef').setLabel('👨‍🍳 Bếp Trưởng').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('help_waiter').setLabel('🤵 Bồi Bàn').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('help_receptionist').setLabel('🛎️ Tiếp Tân').setStyle(ButtonStyle.Success)
        );

        const response = await message.reply({
            embeds: [homeEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            // 🔒 Khóa nút: Kiểm tra ID người bấm có trùng với người gọi lệnh không
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ 
                    content: '❌ Bạn không thể điều khiển bảng trợ giúp của người khác!', 
                    ephemeral: true 
                });
                return;
            }

            const embed = new EmbedBuilder().setColor('#FEE75C');

            // 🔄 Cập nhật Embed tương ứng với nút bấm
            switch (interaction.customId) {
                case 'help_general':
                    embed.setTitle('👤 Danh Sách Lệnh Chung')
                        .setDescription(
                            '• `mprofile`: Xem thông tin cá nhân, chức vụ, cấp độ & ví tiền 💳\n' +
                            '• `mrecipe`: Xem sổ tay công thức nấu ăn của nhà hàng 📖\n' +
                            '• `mhelp`: Hướng dẫn sử dụng hệ thống lệnh 📜'
                        );
                    break;

                case 'help_chef':
                    embed.setTitle('👨‍🍳 Danh Sách Lệnh Bếp Trưởng (Chef)')
                        .setDescription(
                            '• `mcook <mã món>`: Bắt đầu nấu món ăn theo yêu cầu 🍳\n' +
                            '  *(Ví dụ: `mcook rau luoc` hoặc `mcook bo luc lac`)*'
                        );
                    break;

                case 'help_waiter':
                    embed.setTitle('🤵 Danh Sách Lệnh Bồi Bàn (Waiter)')
                        .setDescription(
                            '• `mtakeorder`: Bắt đầu nhận đơn đặt món từ các bàn 📝\n' +
                            '• `mserve`: Bê món ăn đã nấu xong ra cho khách 🍽️\n' +
                            '• `mtips`: Nhận tiền tip thưởng thêm từ khách 💵'
                        );
                    break;

                case 'help_receptionist':
                    embed.setTitle('🛎️ Danh Sách Lệnh Tiếp Tân (Receptionist)')
                        .setDescription(
                            '• `mwelcome`: Đón khách mới vào nhà hàng 🚪\n' +
                            '• `mseat`: Xếp chỗ ngồi cho khách vào bàn trống 🪑'
                        );
                    break;
            }

            await interaction.update({ embeds: [embed] });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map(b => ButtonBuilder.from(b).setDisabled(true))
            );
            await response.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
}
