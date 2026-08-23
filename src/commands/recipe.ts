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
    name: 'recipe',
    aliases: ['mrecipe', 'Mrecipe', 'recipes', 'Recipes'],
    description: 'Xem sổ tay công thức nấu ăn của nhà hàng.'
})
export class RecipeCommand extends Command {
    public override async messageRun(message: Message) {
        // Embed mặc định (Trang chủ)
        const baseEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📖 Sổ Tay Công Thức Nấu Ăn - "Hết Khô Gà"')
            .setDescription(
                'Chào mừng đến với sổ tay công thức! 👨‍🍳\n' +
                'Hãy chọn danh mục bên dưới để xem nguyên liệu và mã nấu (`mcook`) của từng món ăn nhé!\n\n' +
                '💡 **Mẹo:** Tích lũy EXP để thăng cấp và mở khóa thêm danh mục mới.'
            )
            .setFooter({ text: 'Hãy bấm các nút bên dưới để chuyển danh mục!' });

        // Tạo các nút bấm danh mục
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('cat_newbie').setLabel('🔰 Tân Thủ').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cat_starter').setLabel('🥗 Khai Vị').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cat_soup').setLabel('🥣 Canh & Rau').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cat_main').setLabel('🥩 Món Chính').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cat_dry').setLabel('🔥 Món Khô').setStyle(ButtonStyle.Danger)
        );

        const response = await message.reply({
            embeds: [baseEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000 // Hạn tương tác 60 giây
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: '❌ Bạn không thể điều khiển menu này!', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder().setColor('#FEE75C');

            switch (interaction.customId) {
                case 'cat_newbie':
                    embed.setTitle('🔰 Món Tân Thủ (Level 1)').setDescription(
                        '• **Rau Luộc** (mã: `rau luoc`)\n  👉 *Công thức:* `2 Bắp Cải`\n' +
                        '• **Rau Xào** (mã: `rau xao`)\n  👉 *Công thức:* `2 Bắp Cải` + `1 Tiêu`\n' +
                        '• **Bánh Mì** (mã: `banh mi`)\n  👉 *Công thức:* `1 Tiêu`\n' +
                        '• **Bánh Bao Chiên** (mã: `banh bao chien`)\n  👉 *Công thức:* `1 Tương Ớt`\n' +
                        '• **Ngô Chiên** (mã: `ngo chien`)\n  👉 *Công thức:* `1 Bắp Cải` + `1 Tiêu`\n' +
                        '• **Khoai Chiên** (mã: `khoai chien`)\n  👉 *Công thức:* `1 Bắp Cải` + `1 Tương Cà`\n' +
                        '• **Súp Khai Vị** (mã: `sup`)\n  👉 *Công thức:* `1 Gà` + `1 Tiêu`\n' +
                        '• **Salad Tươi** (mã: `salad`)\n  👉 *Công thức:* `2 Xà Lách` + `1 Tiêu`'
                    );
                    break;

                case 'cat_starter':
                    embed.setTitle('🥗 Món Khai Vị (Level 1+)').setDescription(
                        '*(Các món khai vị nhẹ nhàng đã có trong mục Tân Thủ)*\n' +
                        'Hãy chọn món ăn bạn thích và gõ `mcook <mã món>` để bắt đầu!'
                    );
                    break;

                case 'cat_soup':
                    embed.setTitle('🥣 Canh & Rau (Level 2+)').setDescription(
                        '• **Canh Rau Cúc** (mã: `canh rau cuc`)\n  👉 *Công thức:* `2 Rau Cúc` + `1 Nước Mắm`\n' +
                        '• **Canh Rau Cải** (mã: `canh rau cai`)\n  👉 *Công thức:* `2 Bắp Cải` + `1 Nước Mắm`\n' +
                        '• **Canh Rau Muống** (mã: `canh rau muong`)\n  👉 *Công thức:* `2 Rau Muống` + `1 Nước Mắm`\n' +
                        '• **Rau Cải Xào** (mã: `rau cai xao`)\n  👉 *Công thức:* `2 Bắp Cải` + `1 Tiêu`\n' +
                        '• **Rau Muống Xào** (mã: `rau muong xao`)\n  👉 *Công thức:* `2 Rau Muống` + `1 Tiêu`'
                    );
                    break;

                case 'cat_main':
                    embed.setTitle('🥩 Món Chính (Level 3+)').setDescription(
                        '🥩 **Món Bò:**\n' +
                        '• **Bò Xào Rau Muống** (mã: `bo xao rau muong`)\n  👉 *Công thức:* `2 Bò` + `1 Rau Muống` + `1 Nước Mắm`\n' +
                        '• **Bò Lúc Lắc** (mã: `bo luc lac`)\n  👉 *Công thức:* `2 Bò` + `1 Xà Lách` + `1 Tương Ớt`\n' +
                        '• **Bò Nướng** (mã: `bo nuong`)\n  👉 *Công thức:* `2 Bò` + `1 Tương Ớt`\n\n' +
                        '🐖 **Món Heo:**\n' +
                        '• **Thịt Nướng** (mã: `thit nuong`)\n  👉 *Công thức:* `2 Heo` + `1 Tương Ớt`\n' +
                        '• **Thịt Nướng Lổ Bì 💥** (mã: `thit nuong lo bi`)\n  👉 *Công thức:* `3 Heo` + `1 Tiêu` + `1 Nước Mắm`\n' +
                        '• **Thịt Luộc** (mã: `thit luoc`)\n  👉 *Công thức:* `2 Heo` + `1 Nước Mắm`\n' +
                        '• **Bì Heo Luộc 💥** (mã: `bi heo luoc`)\n  👉 *Công thức:* `2 Heo` + `1 Tiêu`\n' +
                        '• **Tóp Mỡ** (mã: `top mo`)\n  👉 *Công thức:* `2 Heo` + `1 Tương Ớt`\n' +
                        '• **Kho Quẹt** (mã: `kho quet`)\n  👉 *Công thức:* `1 Heo` + `2 Nước Mắm` + `1 Tương Ớt`\n\n' +
                        '🦆🐔 **Món Gia Cầm:**\n' +
                        '• **Vịt Nướng** (mã: `vit nuong`) | **Vịt Om** (mã: `vit om`)\n' +
                        '• **Ngan Luộc** (mã: `ngan luoc`) | **Vịt Luộc** (mã: `vit luoc`)\n' +
                        '• **Gà Chiên** (mã: `ga chien`) | **Gà Xào** (mã: `ga xao`) | **Gà Nướng** (mã: `ga nuong`)'
                    );
                    break;

                case 'cat_dry':
                    embed.setTitle('🔥 Món Khô Đặc Biệt (Level 5+)').setDescription(
                        '• **Khô Gà Lá Chanh 💥** (mã: `kho ga`)\n  👉 *Công thức:* `3 Gà` + `2 Tương Ớt` + `1 Tiêu`\n' +
                        '• **Khô Bò Sợi 💥** (mã: `kho bo`)\n  👉 *Công thức:* `3 Bò` + `2 Tương Ớt` + `1 Tiêu`\n\n' +
                        '*(Sắp ra mắt thêm nhiều món mới...)*'
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
