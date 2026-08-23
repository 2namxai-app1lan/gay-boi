import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
    name: 'recipe',
    aliases: ['mrecipe', 'recipes'],
    description: 'Xem sổ tay công thức nấu ăn của nhà hàng.'
})
export class RecipeCommand extends Command {
    public override async messageRun(message: Message) {
        const recipeEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📖 Sổ Tay Công Thức Nấu Ăn - "Hết Khô Gà"')
            .setDescription('Tích lũy **EXP** từ các món ăn để nâng **Level** và mở khóa công thức mới! 👨‍🍳\n')
            .addFields(
                {
                    name: '🔰 Level 1 - Tập Sự (Món Khai Vị & Cơ Bản)',
                    value: 
                        '• **Rau Luộc**: `2 Rau` (Món Tutorial)\n' +
                        '• **Rau Xào**: `2 Rau` + `1 Gia vị`\n' +
                        '• **Bánh Mì / Bánh Bao Chiên**: `1 Gia vị`\n' +
                        '• **Ngô Chiên / Khoai Chiên**: `1 Rau` + `1 Gia vị`\n' +
                        '• **Súp (Cua/Gà/Nấm)**: `1 Thịt` + `1 Gia vị`\n' +
                        '• **Salad**: `2 Rau` + `1 Gia vị`',
                    inline: false
                },
                {
                    name: '🥣 Level 2 - Bếp Chính (Món Canh & Rau)',
                    value: 
                        '• **Canh Rau Cúc / Cải / Muống**: `2 Rau` + `1 Gia vị`\n' +
                        '• **Rau Cải Xào / Muống Xào**: `2 Rau` + `1 Gia vị`',
                    inline: false
                },
                {
                    name: '🥩 Level 3 - Bếp Trưởng (Món Chính)',
                    value: 
                        '• **Bò**: Bò xào rau muống, Bò lúc lắc, Bò nướng\n' +
                        '• **Heo**: Thịt nướng, Thịt nướng "lổ" bì 💥, Thịt luộc, Bì heo luộc, Tóp mỡ, Kho quẹt\n' +
                        '• **Gia Cầm**: Vịt/Ngan nướng, Vịt om, Ngan/Vịt luộc, Gà chiên/xào/nướng',
                    inline: false
                },
                {
                    name: '🔥 Level 5 - Bậc Thầy (Món Khô Đặc Biệt)',
                    value: 
                        '• **Khô Gà** 💥\n' +
                        '• **Khô Bò**\n' +
                        '*(Và nhiều món mới sắp ra mắt...)*',
                    inline: false
                }
            )
            .setFooter({ text: '💡 Gõ mcook <mã món> để nấu! Ví dụ: mcook rau luoc' });

        await message.reply({ embeds: [recipeEmbed] });
    }
}
