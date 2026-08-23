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

// Danh sách công thức xử lý logic
const RECIPES: Record<string, any> = {
    'com ga': {
        name: 'Cơm Gà Xối Mỡ',
        req: { chicken: 2, cabbage: 1, pepper: 1 },
        time: 15000, // 15 giây
        rewardCoins: 300,
        rewardExp: 20
    },
    'bo luc lac': {
        name: 'Bò Lúc Lắc',
        req: { beef: 2, lettuce: 1, chili_sauce: 1 },
        time: 20000, // 20 giây
        rewardCoins: 450,
        rewardExp: 35
    },
    'thit kho tau': {
        name: 'Thịt Kho Tàu',
        req: { pork: 2, water_spinach: 1, fish_sauce: 1 },
        time: 25000, // 25 giây
        rewardCoins: 500,
        rewardExp: 40
    }
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

        // Khởi tạo hồ sơ nếu chưa có
        if (!data[userId]) {
            data[userId] = {
                job: 'Chef',
                level: 1,
                exp: 0,
                coins: 1000,
                isNewbie: true, // Đánh dấu tân thủ
                inventory: {
                    meats: { chicken: 5, beef: 2, pork: 3, duck: 0 },
                    veggies: { cabbage: 5, lettuce: 5, water_spinach: 3, garland_chrysanthemum: 0 },
                    spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 },
                    coupons: 1
                }
            };
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }

        const player = data[userId];

        // 🌟 1. HIỂN THỊ TUTORIAL NẾU LÀ LẦN ĐẦU CHƠI
        if (player.isNewbie) {
            const tutorialEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔰 HƯỚNG DẪN TÂN THỦ ĐẦU BẾP')
                .setDescription(
                    `Chào mừng bạn đến với căn bếp! Đây là lần đầu bạn nấu ăn.\n\n` +
                    `📖 **Bước 1:** Gõ lệnh \`mrecipe\` để xem danh sách món ăn và nguyên liệu cần thiết.\n` +
                    `🍳 **Bước 2:** Gõ \`mcook <tên món>\` (Ví dụ: \`mcook com ga\`) để bắt đầu chế biến.\n` +
                    `⏱️ **Lưu ý:** Khi nấu sẽ có đếm ngược thời gian. Bạn phải nhấn nút **"Bê Món"** kịp lúc, nếu không món ăn sẽ bị cháy và bị phạt tiền!`
                )
                .setFooter({ text: 'Hãy gõ mrecipe để xem công thức ngay nhé!' });

            // Cập nhật bỏ trạng thái tân thủ sau khi đã hiện tutorial
            player.isNewbie = false;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));

            await message.reply({ embeds: [tutorialEmbed] });
            return;
        }

        // 🌟 2. XỬ LÝ LỆNH NẤU ĂN
        const recipeKey = (await args.rest('string').catch(() => '')).toLowerCase().trim();
        const recipe = RECIPES[recipeKey];

        if (!recipe) {
            await message.reply('❌ Món ăn không hợp lệ! Hãy gõ lệnh `mrecipe` để xem danh sách công thức.');
            return;
        }

        // Kiểm tra nguyên liệu trong kho
        const meats = player.inventory?.meats || {};
        const veggies = player.inventory?.veggies || {};
        const spices = player.inventory?.spices || {};

        for (const [item, amount] of Object.entries(recipe.req)) {
            const currentAmount = (meats[item] || 0) + (veggies[item] || 0) + (spices[item] || 0);
            if (currentAmount < (amount as number)) {
                await message.reply(`❌ Bạn thiếu nguyên liệu để nấu **${recipe.name}**! Hãy gõ \`mstore\` để mua thêm.`);
                return;
            }
        }

        // Trừ nguyên liệu
        for (const [item, amount] of Object.entries(recipe.req)) {
            if (meats[item] !== undefined) meats[item] -= (amount as number);
            if (veggies[item] !== undefined) veggies[item] -= (amount as number);
            if (spices[item] !== undefined) spices[item] -= (amount as number);
        }
        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        // Bắt đầu đếm ngược thời gian nấu
        const cookingEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle(`🍳 Đang nấu món: ${recipe.name}...`)
            .setDescription(`⏱️ Thời gian chế biến: **${recipe.time / 1000} giây**!\nHãy nhanh tay nhấn nút **"Bê Món Ra"** trước khi món ăn bị cháy!`)
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

            // Cộng tiền và EXP khi hoàn thành
            let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
            updatedData[userId].coins = (updatedData[userId].coins || 0) + recipe.rewardCoins;
            updatedData[userId].exp = (updatedData[userId].exp || 0) + recipe.rewardExp;
            fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle(`🎉 Nấu thành công: ${recipe.name}!`)
                .setDescription(`Món ăn đã được phục vụ hoàn hảo!\n💰 **Nhận được:** \`+${recipe.rewardCoins} Coins\`\n⭐ **Kinh nghiệm:** \`+${recipe.rewardExp} EXP\``);

            await interaction.update({ embeds: [successEmbed], components: [] });
        });

        collector.on('end', async () => {
            if (!served) {
                // Phạt tiền khi nấu cháy (Trừ 100 Coins)
                let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
                const penalty = 100;
                updatedData[userId].coins = Math.max(0, (updatedData[userId].coins || 0) - penalty);
                fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

                const failEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle(`💥 Món ăn đã bị cháy!`)
                    .setDescription(`Bạn đã quá thời gian chế biến món **${recipe.name}**!\n💸 **Hình phạt:** Bị trừ \`${penalty} Coins\` tiền bồi thường nguyên liệu.`);

                const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    row.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
                );

                await response.edit({ embeds: [failEmbed], components: [disabledRow] }).catch(() => {});
            }
        });
    }
}
