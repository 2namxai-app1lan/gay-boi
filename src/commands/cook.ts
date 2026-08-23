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

// Danh sách dữ liệu công thức chuẩn
const RECIPES: Record<string, any> = {
    // 🔰 LEVEL 1
    'rau luoc': { name: 'Rau Luộc', levelReq: 1, req: { cabbage: 2 }, time: 10000, rewardCoins: 150, rewardExp: 15 },
    'rau xao': { name: 'Rau Xào', levelReq: 1, req: { cabbage: 2, pepper: 1 }, time: 12000, rewardCoins: 180, rewardExp: 18 },
    'banh mi': { name: 'Bánh Mì', levelReq: 1, req: { pepper: 1 }, time: 8000, rewardCoins: 100, rewardExp: 10 },
    'banh bao chien': { name: 'Bánh Bao Chiên', levelReq: 1, req: { chili_sauce: 1 }, time: 10000, rewardCoins: 120, rewardExp: 12 },
    'ngo chien': { name: 'Ngô Chiên', levelReq: 1, req: { cabbage: 1, pepper: 1 }, time: 10000, rewardCoins: 130, rewardExp: 13 },
    'khoai chien': { name: 'Khoai Chiên', levelReq: 1, req: { cabbage: 1, ketchup: 1 }, time: 10000, rewardCoins: 130, rewardExp: 13 },
    'sup': { name: 'Súp Khai Vị', levelReq: 1, req: { chicken: 1, pepper: 1 }, time: 15000, rewardCoins: 220, rewardExp: 22 },
    'salad': { name: 'Salad Tươi', levelReq: 1, req: { lettuce: 2, pepper: 1 }, time: 10000, rewardCoins: 160, rewardExp: 16 },

    // 🥣 LEVEL 2
    'canh rau cuc': { name: 'Canh Rau Cúc', levelReq: 2, req: { garland_chrysanthemum: 2, fish_sauce: 1 }, time: 15000, rewardCoins: 250, rewardExp: 25 },
    'canh rau cai': { name: 'Canh Rau Cải', levelReq: 2, req: { cabbage: 2, fish_sauce: 1 }, time: 15000, rewardCoins: 250, rewardExp: 25 },
    'canh rau muong': { name: 'Canh Rau Muống', levelReq: 2, req: { water_spinach: 2, fish_sauce: 1 }, time: 15000, rewardCoins: 250, rewardExp: 25 },
    'rau cai xao': { name: 'Rau Cải Xào', levelReq: 2, req: { cabbage: 2, pepper: 1 }, time: 15000, rewardCoins: 240, rewardExp: 24 },
    'rau muong xao': { name: 'Rau Muống Xào', levelReq: 2, req: { water_spinach: 2, pepper: 1 }, time: 15000, rewardCoins: 240, rewardExp: 24 },

    // 🥩 LEVEL 3
    'bo xao rau muong': { name: 'Bò Xào Rau Muống', levelReq: 3, req: { beef: 2, water_spinach: 1, fish_sauce: 1 }, time: 20000, rewardCoins: 450, rewardExp: 40 },
    'bo luc lac': { name: 'Bò Lúc Lắc', levelReq: 3, req: { beef: 2, lettuce: 1, chili_sauce: 1 }, time: 20000, rewardCoins: 480, rewardExp: 45 },
    'bo nuong': { name: 'Bò Nướng', levelReq: 3, req: { beef: 2, chili_sauce: 1 }, time: 22000, rewardCoins: 500, rewardExp: 50 },
    'thit nuong': { name: 'Thịt Heo Nướng', levelReq: 3, req: { pork: 2, chili_sauce: 1 }, time: 20000, rewardCoins: 420, rewardExp: 38 },
    'thit nuong lo bi': { name: 'Thịt Nướng Lổ Bì 💥', levelReq: 3, req: { pork: 3, pepper: 1, fish_sauce: 1 }, time: 25000, rewardCoins: 600, rewardExp: 60 },
    'thit luoc': { name: 'Thịt Heo Luộc', levelReq: 3, req: { pork: 2, fish_sauce: 1 }, time: 18000, rewardCoins: 380, rewardExp: 35 },
    'bi heo luoc': { name: 'Bì Heo Luộc Bột Canh 💥', levelReq: 3, req: { pork: 2, pepper: 1 }, time: 18000, rewardCoins: 400, rewardExp: 38 },
    'top mo': { name: 'Tóp Mỡ Giòn Rụm', levelReq: 3, req: { pork: 2, chili_sauce: 1 }, time: 15000, rewardCoins: 350, rewardExp: 30 },
    'kho quet': { name: 'Kho Quẹt', levelReq: 3, req: { pork: 1, fish_sauce: 2, chili_sauce: 1 }, time: 22000, rewardCoins: 480, rewardExp: 45 },
    'vit nuong': { name: 'Vịt Nướng', levelReq: 3, req: { duck: 2, chili_sauce: 1 }, time: 22000, rewardCoins: 520, rewardExp: 50 },
    'vit om': { name: 'Vịt Om', levelReq: 3, req: { duck: 2, cabbage: 1, fish_sauce: 1 }, time: 25000, rewardCoins: 550, rewardExp: 55 },
    'ngan luoc': { name: 'Ngan Luộc', levelReq: 3, req: { duck: 2, fish_sauce: 1 }, time: 20000, rewardCoins: 460, rewardExp: 42 },
    'vit luoc': { name: 'Vịt Luộc', levelReq: 3, req: { duck: 2, fish_sauce: 1 }, time: 20000, rewardCoins: 460, rewardExp: 42 },
    'ga chien': { name: 'Gà Chiên Giòn', levelReq: 3, req: { chicken: 2, chili_sauce: 1 }, time: 18000, rewardCoins: 400, rewardExp: 38 },
    'ga xao': { name: 'Gà Xào Sả Ớt', levelReq: 3, req: { chicken: 2, pepper: 1 }, time: 18000, rewardCoins: 400, rewardExp: 38 },
    'ga nuong': { name: 'Gà Nướng Mật Ong', levelReq: 3, req: { chicken: 2, chili_sauce: 1 }, time: 22000, rewardCoins: 480, rewardExp: 45 },

    // 🔥 LEVEL 5
    'kho ga': { name: 'Khô Gà Lá Chanh 💥', levelReq: 5, req: { chicken: 3, chili_sauce: 2, pepper: 1 }, time: 30000, rewardCoins: 800, rewardExp: 80 },
    'kho bo': { name: 'Khô Bò Sợi 💥', levelReq: 5, req: { beef: 3, chili_sauce: 2, pepper: 1 }, time: 30000, rewardCoins: 900, rewardExp: 90 }
};

@ApplyOptions<Command.Options>({
    name: 'cook',
    aliases: ['mcook'],
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

        // Khởi tạo hồ sơ người chơi
        if (!data[userId]) {
            data[userId] = {
                job: 'Chef',
                level: 1,
                exp: 0,
                coins: 1000,
                isNewbie: true,
                inventory: {
                    meats: { chicken: 5, beef: 2, pork: 3, duck: 2 },
                    veggies: { cabbage: 5, lettuce: 5, water_spinach: 3, garland_chrysanthemum: 2 },
                    spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 },
                    coupons: 1
                }
            };
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }

        const player = data[userId];

        // 🌟 1. HIỂN THỊ TUTORIAL NẾU LÀ TÂN THỦ
        if (player.isNewbie) {
            const tutorialEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔰 HƯỚNG DẪN TÂN THỦ ĐẦU BẾP')
                .setDescription(
                    `Chào mừng bạn đến với căn bếp! Hãy bắt đầu với món ăn đơn giản nhất.\n\n` +
                    `📖 **Bước 1:** Gõ \`mrecipe\` để mở sổ tay công thức.\n` +
                    `🍳 **Bước 2:** Hãy thử gõ \`mcook rau luoc\` để thực hành nấu món đầu tiên!\n` +
                    `⏱️ **Lưu ý:** Hãy bấm nút **"Bê Món Ra"** trước khi hết giờ đếm ngược!`
                )
                .setFooter({ text: 'Gõ mcook rau luoc ngay nhé!' });

            player.isNewbie = false;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));

            await message.reply({ embeds: [tutorialEmbed] });
            return;
        }

        // 🌟 2. XỬ LÝ LỆNH NẤU ÁN
        const recipeKey = (await args.rest('string').catch(() => '')).toLowerCase().trim();
        const recipe = RECIPES[recipeKey];

        if (!recipe) {
            await message.reply('❌ Món ăn không tồn tại! Gõ `mrecipe` để xem danh sách công thức chuẩn.');
            return;
        }

        // Kiểm tra Level
        const playerLevel = player.level || 1;
        if (playerLevel < recipe.levelReq) {
            await message.reply(`🔒 Bạn chưa đủ cấp độ! Món **${recipe.name}** yêu cầu **Level ${recipe.levelReq}** (Level hiện tại của bạn: \`${playerLevel}\`).`);
            return;
        }

        // Kiểm tra nguyên liệu trong kho
        const meats = player.inventory?.meats || {};
        const veggies = player.inventory?.veggies || {};
        const spices = player.inventory?.spices || {};

        for (const [item, amount] of Object.entries(recipe.req)) {
            const currentAmount = (meats[item] || 0) + (veggies[item] || 0) + (spices[item] || 0);
            if (currentAmount < (amount as number)) {
                await message.reply(`❌ Bạn thiếu nguyên liệu để nấu món **${recipe.name}**! Gõ \`mstore\` để mua thêm.`);
                return;
            }
        }

        // Trừ nguyên liệu
        for (const [item, amount] of Object.entries(recipe.req)) {
            if (meats[item] !== undefined && meats[item] >= (amount as number)) meats[item] -= (amount as number);
            else if (veggies[item] !== undefined && veggies[item] >= (amount as number)) veggies[item] -= (amount as number);
            else if (spices[item] !== undefined && spices[item] >= (amount as number)) spices[item] -= (amount as number);
        }
        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        // Đếm ngược thời gian
        const cookingEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle(`🍳 Đang chế biến: ${recipe.name}...`)
            .setDescription(`⏱️ Thời gian: **${recipe.time / 1000} giây**!\nBấm nút **"Bê Món Ra"** ngay trước khi món ăn bị cháy!`)
            .setFooter({ text: 'Nhanh tay lên đầu bếp ơi!' });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('serve_dish')
                .setLabel('🍽️ Bê Món Ra')
                .setStyle(ButtonStyle.Success)
        );

        const response = await message.reply({
            embeds: [cookingEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: recipe.time
        });

        let served = false;

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: '❌ Đây không phải món ăn của bạn!', ephemeral: true });
                return;
            }

            served = true;
            collector.stop();

            // Cộng Coins và EXP, hỗ trợ lên cấp (Level Up)
            let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
            let curPlayer = updatedData[userId];
            
            curPlayer.coins = (curPlayer.coins || 0) + recipe.rewardCoins;
            curPlayer.exp = (curPlayer.exp || 0) + recipe.rewardExp;

            // Cơ chế lên cấp: 100 EXP = 1 Level
            let levelUpMsg = '';
            if (curPlayer.exp >= curPlayer.level * 100) {
                curPlayer.level += 1;
                levelUpMsg = `\n🎊 **CHÚC MỪNG! Bạn đã thăng cấp lên Level ${curPlayer.level}!** Hãy gõ \`mrecipe\` để xem món mới mở khóa!`;
            }

            fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle(`🎉 Chế biến thành công: ${recipe.name}!`)
                .setDescription(
                    `Món ăn đã được hoàn thành tuyệt vời!\n` +
                    `💰 **Nhận được:** \`+${recipe.rewardCoins} Coins\`\n` +
                    `⭐ **Kinh nghiệm:** \`+${recipe.rewardExp} EXP\`${levelUpMsg}`
                );

            await interaction.update({ embeds: [successEmbed], components: [] });
        });

        collector.on('end', async () => {
            if (!served) {
                let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
                const penalty = 100;
                updatedData[userId].coins = Math.max(0, (updatedData[userId].coins || 0) - penalty);
                fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

                const failEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle(`💥 Món ăn đã bị cháy!`)
                    .setDescription(`Bạn đã để quá thời gian khi nấu **${recipe.name}**!\n💸 **Hình phạt:** Bị trừ \`${penalty} Coins\` bồi thường nguyên liệu.`);

                const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    row.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
                );

                await response.edit({ embeds: [failEmbed], components: [disabledRow] }).catch(() => {});
            }
        });
    }
}
