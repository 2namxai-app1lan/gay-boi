import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
    name: 'recipe',
    aliases: ['mrecipe', 'Mrecipe', 'recipes', 'Recipes'],
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
                        '• **Rau Luộc**: `2 Rau` (Món Tutorial - mã: `rau luoc`)\n' +
                        '• **Rau Xào**: `2 Rau` + `1 Gia vị` (mã: `rau xao`)\n' +
                        '• **Bánh Mì**: `1 Gia vị` (mã: `banh mi`)\n' +
                        '• **Bánh Bao Chiên**: `1 Gia vị` (mã: `banh bao chien`)\n' +
                        '• **Ngô Chiên**: `1 Rau` + `1 Gia vị` (mã: `ngo chien`)\n' +
                        '• **Khoai Chiên**: `1 Rau` + `1 Gia vị` (mã: `khoai chien`)\n' +
                        '• **Súp Khai Vị**: `1 Thịt` + `1 Gia vị` (mã: `sup`)\n' +
                        '• **Salad Tươi**: `2 Rau` + `1 Gia vị` (mã: `salad`)',
                    inline: false
                },
                {
                    name: '🥣 Level 2 - Bếp Chính (Món Canh & Rau)',
                    value: 
                        '• **Canh Rau Cúc / Cải / Muống**: `2 Rau` + `1 Gia vị` (mã: `canh rau cuc`, `canh rau cai`, `canh rau muong`)\n' +
                        '• **Rau Cải Xào / Muống Xào**: `2 Rau` + `1 Gia vị` (mã: `rau cai xao`, `rau muong xao`)',
                    inline: false
                },
                {
                    name: '🥩 Level 3 - Bếp Trưởng (Món Chính)',
                    value: 
                        '• **Bò**: Bò xào rau muống (`bo xao rau muong`), Bò lúc lắc (`bo luc lac`), Bò nướng (`bo nuong`)\n' +
                        '• **Heo**: Thịt nướng (`thit nuong`), Thịt nướng "lổ" bì 💥 (`thit nuong lo bi`), Thịt luộc (`thit luoc`), Bì heo luộc (`bi heo luoc`), Tóp mỡ (`top mo`), Kho quẹt (`kho quet`)\n' +
                        '• **Gia Cầm**: Vịt nướng (`vit nuong`), Vịt om (`vit om`), Ngan luộc (`ngan luoc`), Vịt luộc (`vit luoc`), Gà chiên (`ga chien`), Gà xào (`ga xao`), Gà nướng (`ga nuong`)',
                    inline: false
                },
                {
                    name: '🔥 Level 5 - Bậc Thầy (Món Khô Đặc Biệt)',
                    value: 
                        '• **Khô Gà Lá Chanh** 💥 (mã: `kho ga`)\n' +
                        '• **Khô Bò Sợi** 💥 (mã: `kho bo`)\n' +
                        '*(Và nhiều món mới sắp ra mắt...)*',
                    inline: false
                }
            )
            .setFooter({ text: '💡 Gõ mcook <mã món> để nấu! Ví dụ: mcook rau luoc' });

        await message.reply({ embeds: [recipeEmbed] });
    }
}
