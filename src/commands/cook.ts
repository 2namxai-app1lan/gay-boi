import { ApplyOptions } from '@sapphire/decorators';
import { Command, Args } from '@sapphire/framework';
import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType, 
    EmbedBuilder, 
    Message 
} from 'discord.js';
import fs from 'fs';
import path from 'path';

// 🏷️ Tên hiển thị của từng nguyên liệu trên Button
const ITEM_NAMES: Record<string, string> = {
    chicken: '🍗 Gà',
    beef: '🥩 Bò',
    pork: '🐖 Thịt Heo',
    duck: '🦆 Vịt',
    cabbage: '🥬 Bắp Cải',
    lettuce: '🥗 Xà Lách',
    water_spinach: '🌱 Rau Muống',
    garland_chrysanthemum: '🌿 Rau Cúc',
    pepper: '🌶️ Tiêu/Ớt',
    chili_sauce: '🥫 Tương Ớt',
    ketchup: '🍅 Tương Cà',
    fish_sauce: '🍾 Nước Mắm'
};

// 📖 Danh sách công thức đồng bộ 100% với mrecipe
const RECIPES: Record<string, any> = {
    // 🔰 LEVEL 1 - TÂN THỦ & KHAI VỊ
    'rau luoc': { name: 'Rau Luộc', levelReq: 1, req: ['cabbage'], time: 10000, rewardCoins: 150, rewardExp: 15 },
    'rau xao': { name: 'Rau Xào', levelReq: 1, req: ['cabbage', 'pepper'], time: 12000, rewardCoins: 180, rewardExp: 18 },
    'banh mi': { name: 'Bánh Mì', levelReq: 1, req: ['pepper'], time: 8000, rewardCoins: 100, rewardExp: 10 },
    'banh bao chien': { name: 'Bánh Bao Chiên', levelReq: 1, req: ['chili_sauce'], time: 10000, rewardCoins: 120, rewardExp: 12 },
    'ngo chien': { name: 'Ngô Chiên', levelReq: 1, req: ['cabbage', 'pepper'], time: 10000, rewardCoins: 130, rewardExp: 13 },
    'khoai chien': { name: 'Khoai Chiên', levelReq: 1, req: ['cabbage', 'ketchup'], time: 10000, rewardCoins: 130, rewardExp: 13 },
    'sup': { name: 'Súp Khai Vị', levelReq: 1, req: ['chicken', 'pepper'], time: 15000, rewardCoins: 220, rewardExp: 22 },
    'salad': { name: 'Salad Tươi', levelReq: 1, req: ['lettuce', 'pepper'], time: 10000, rewardCoins: 160, rewardExp: 16 },

    // 🥣 LEVEL 2 - CANH & RAU
    'canh rau cuc': { name: 'Canh Rau Cúc', levelReq: 2, req: ['garland_chrysanthemum', 'fish_sauce'], time: 15000, rewardCoins: 250, rewardExp: 25 },
    'canh rau cai': { name: 'Canh Rau Cải', levelReq: 2, req: ['cabbage', 'fish_sauce'], time: 15000, rewardCoins: 250, rewardExp: 25 },
    'canh rau muong': { name: 'Canh Rau Muống', levelReq: 2, req: ['water_spinach', 'fish_sauce'], time: 15000, rewardCoins: 250, rewardExp: 25 },
    'rau cai xao': { name: 'Rau Cải Xào', levelReq: 2, req: ['cabbage', 'pepper'], time: 15000, rewardCoins: 240, rewardExp: 24 },
    'rau muong xao': { name: 'Rau Muống Xào', levelReq: 2, req: ['water_spinach', 'pepper'], time: 15000, rewardCoins: 240, rewardExp: 24 },

    // 🥩 LEVEL 3 - MÓN CHÍNH
    'bo xao rau muong': { name: 'Bò Xào Rau Muống', levelReq: 3, req: ['beef', 'water_spinach', 'fish_sauce'], time: 20000, rewardCoins: 450, rewardExp: 40 },
    'bo luc lac': { name: 'Bò Lúc Lắc', levelReq: 3, req: ['beef', 'lettuce', 'chili_sauce'], time: 20000, rewardCoins: 480, rewardExp: 45 },
    'bo nuong': { name: 'Bò Nướng', levelReq: 3, req: ['beef', 'chili_sauce'], time: 22000, rewardCoins: 500, rewardExp: 50 },
    'thit nuong': { name: 'Thịt Heo Nướng', levelReq: 3, req: ['pork', 'chili_sauce'], time: 20000, rewardCoins: 420, rewardExp: 38 },
    'thit nuong lo bi': { name: 'Thịt Nướng Lổ Bì 💥', levelReq: 3, req: ['pork', 'pepper', 'fish_sauce'], time: 25000, rewardCoins: 600, rewardExp: 60 },
    'thit luoc': { name: 'Thịt Heo Luộc', levelReq: 3, req: ['pork', 'fish_sauce'], time: 18000, rewardCoins: 380, rewardExp: 35 },
    'bi heo luoc': { name: 'Bì Heo Luộc 💥', levelReq: 3, req: ['pork', 'pepper'], time: 18000, rewardCoins: 400, rewardExp: 38 },
    'top mo': { name: 'Tóp Mỡ Giòn Rụm', levelReq: 3, req: ['pork', 'chili_sauce'], time: 15000, rewardCoins: 350, rewardExp: 30 },
    'kho quet': { name: 'Kho Quẹt', levelReq: 3, req: ['pork', 'fish_sauce', 'chili_sauce'], time: 22000, rewardCoins: 480, rewardExp: 45 },
    'vit nuong': { name: 'Vịt Nướng', levelReq: 3, req: ['duck', 'chili_sauce'], time: 22000, rewardCoins: 520, rewardExp: 50 },
    'vit om': { name: 'Vịt Om', levelReq: 3, req: ['duck', 'cabbage', 'fish_sauce'], time: 25000, rewardCoins: 550, rewardExp: 55 },
    'ngan luoc': { name: 'Ngan Luộc', levelReq: 3, req: ['duck', 'fish_sauce'], time: 20000, rewardCoins: 460, rewardExp: 42 },
    'vit luoc': { name: 'Vịt Luộc', levelReq: 3, req: ['duck', 'fish_sauce'], time: 20000, rewardCoins: 460, rewardExp: 42 },
    'ga chien': { name: 'Gà Chiên Giòn', levelReq: 3, req: ['chicken', 'chili_sauce'], time: 18000, rewardCoins: 400, rewardExp: 38 },
    'ga xao': { name: 'Gà Xào Sả Ớt', levelReq: 3, req: ['chicken', 'pepper'], time: 18000, rewardCoins: 400, rewardExp: 38 },
    'ga nuong': { name: 'Gà Nướng Mật Ong', levelReq: 3, req: ['chicken', 'chili_sauce'], time: 22000, rewardCoins: 480, rewardExp: 45 },

    // 🔥 LEVEL 5 - MÓN KHÔ ĐẶC BIỆT
    'kho ga': { name: 'Khô Gà Lá Chanh 💥', levelReq: 5, req: ['chicken', 'chili_sauce', 'pepper'], time: 25000, rewardCoins: 800, rewardExp: 80 },
    'kho bo': { name: 'Khô Bò Sợi 💥', levelReq: 5, req: ['beef', 'chili_sauce', 'pepper'], time: 25000, rewardCoins: 900, rewardExp: 90 }
};

@ApplyOptions<Command.Options>({
    name: 'cook',
    aliases: ['mcook', 'Mcook'],
    description: 'Nấu ăn phục vụ thực khách.'
})
export class CookCommand extends Command {
    public override async messageRun(message: Message, args: Args) {
        const file = path.join(process.cwd(), 'src', 'data', 'players.json');

        let data: Record<string, any> = {};
        if (fs.existsSync(file)) {
            try {
                const raw = fs.readFileSync(file, 'utf8').trim();
                data = raw ? JSON.parse(raw) : {};
            } catch {
                data = {};
            }
        }

        const userId = message.author.id;

        // Khởi tạo hồ sơ người chơi nếu chưa có
        if (!data[userId]) {
            data[userId] = {
                job: 'Chef',
                level: 1,
                exp: 0,
                coins: 1000,
                isNewbie: true,
                inventory: {
                    meats: { chicken: 10, beef: 10, pork: 10, duck: 10 },
                    veggies: { cabbage: 10, lettuce: 10, water_spinach: 10, garland_chrysanthemum: 10 },
                    spices: { pepper: 10, chili_sauce: 10, ketchup: 10, fish_sauce: 10 }
                }
            };
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }

        const player = data[userId];

        // 🌟 1. HIỂN THỊ HƯỚNG DẪN TÂN THỦ LẦN ĐẦU
        if (player.isNewbie) {
            const tutorialEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔰 HƯỚNG DẪN TÂN THỦ ĐẦU BẾP')
                .setDescription(
                    `Chào mừng bạn đến với căn bếp!\n\n` +
                    `📖 **Bước 1:** Gõ \`mrecipe\` để xem công thức và nguyên liệu món ăn.\n` +
                    `🍳 **Bước 2:** Thử gõ \`mcook rau luoc\` để bắt đầu nấu thử.\n` +
                    `⏱️ **Lưu ý:** Thời gian đếm ngược sẽ chạy ngay! Bạn cần bấm chọn đủ nguyên liệu trước khi hết giờ!`
                );

            player.isNewbie = false;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));

            await message.reply({ embeds: [tutorialEmbed] });
            return;
        }

        // 🌟 2. KIỂM TRA MÓN ĂN
        const recipeKey = (await args.rest('string').catch(() => '')).toLowerCase().trim();
        const recipe = RECIPES[recipeKey];

        if (!recipe) {
            await message.reply('❌ Món ăn không tồn tại! Gõ `mrecipe` để xem danh sách mã món chuẩn.');
            return;
        }

        // Kiểm tra Level người chơi
        const playerLevel = player.level || 1;
        if (playerLevel < recipe.levelReq) {
            await message.reply(`🔒 Bạn chưa đủ cấp độ! Món **${recipe.name}** yêu cầu **Level ${recipe.levelReq}** (Cấp hiện tại: \`${playerLevel}\`).`);
            return;
        }

        // 🌟 3. TẠO BUTTON NGUYÊN LIỆU (Nguyên liệu đúng + 2 nguyên liệu nhiễu)
        const requiredItems: string[] = recipe.req;
        const allPossibleItems = Object.keys(ITEM_NAMES);
        const wrongItems = allPossibleItems.filter(i => !requiredItems.includes(i)).sort(() => 0.5 - Math.random()).slice(0, 2);
        const displayButtons = [...requiredItems, ...wrongItems].sort(() => 0.5 - Math.random());

        const row = new ActionRowBuilder<ButtonBuilder>();
        displayButtons.forEach(itemKey => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ing_${itemKey}`)
                    .setLabel(ITEM_NAMES[itemKey] || itemKey)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        let selectedItems: string[] = [];

        const cookingEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle(`🍳 Đang chế biến: ${recipe.name}`)
            .setDescription(
                `⏱️ Thời gian: **${recipe.time / 1000} giây**!\n` +
                `🎯 **Hãy bấm chọn đủ các nguyên liệu cần thiết bên dưới!**\n\n` +
                `📥 **Đã chọn:** *(Chưa chọn)*`
            );

        const response = await message.reply({
            embeds: [cookingEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: recipe.time
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: '❌ Đây không phải bếp của bạn!', ephemeral: true });
                return;
            }

            const chosenItem = interaction.customId.replace('ing_', '');

            if (!selectedItems.includes(chosenItem)) {
                selectedItems.push(chosenItem);
            }

            // Kiểm tra xem đã bấm đủ tất cả nguyên liệu bắt buộc chưa
            const isCompleted = requiredItems.every(item => selectedItems.includes(item));

            if (isCompleted) {
                collector.stop('completed');

                let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
                let curPlayer = updatedData[userId];

                curPlayer.coins = (curPlayer.coins || 0) + recipe.rewardCoins;
                curPlayer.exp = (curPlayer.exp || 0) + recipe.rewardExp;

                // Xử lý thăng cấp (Level Up)
                let levelMsg = '';
                if (curPlayer.exp >= curPlayer.level * 100) {
                    curPlayer.level += 1;
                    levelMsg = `\n🎊 **CHÚC MỪNG! Bạn đã thăng cấp lên Level ${curPlayer.level}!**`;
                }

                fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle(`🎉 Chế biến thành công: ${recipe.name}!`)
                    .setDescription(
                        `Bạn đã chọn chuẩn xác các nguyên liệu!\n` +
                        `💰 **Thưởng:** \`+${recipe.rewardCoins} Coins\`\n` +
                        `⭐ **Kinh nghiệm:** \`+${recipe.rewardExp} EXP\`${levelMsg}`
                    );

                await interaction.update({ embeds: [successEmbed], components: [] });
            } else {
                // Cập nhật nguyên liệu đã chọn trên giao diện
                const selectedLabels = selectedItems.map(k => ITEM_NAMES[k]).join(', ');
                const updatedEmbed = EmbedBuilder.from(cookingEmbed).setDescription(
                    `⏱️ Thời gian: **${recipe.time / 1000} giây**!\n` +
                    `🎯 **Hãy bấm chọn đủ các nguyên liệu cần thiết bên dưới!**\n\n` +
                    `📥 **Đã chọn:** ${selectedLabels}`
                );

                await interaction.update({ embeds: [updatedEmbed] });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'completed') {
                let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
                const penalty = 100;
                updatedData[userId].coins = Math.max(0, (updatedData[userId].coins || 0) - penalty);
                fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

                const failEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle(`💥 Món ăn đã bị cháy!`)
                    .setDescription(`Bạn không chọn đủ nguyên liệu trước khi hết giờ!\n💸 **Phạt:** Trừ \`${penalty} Coins\`.`);

                await response.edit({ embeds: [failEmbed], components: [] }).catch(() => {});
            }
        });
    }
}
