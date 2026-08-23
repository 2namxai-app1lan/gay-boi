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

// Danh sách tên nguyên liệu tiếng Việt
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

const RECIPES: Record<string, any> = {
    'rau luoc': { name: 'Rau Luộc', levelReq: 1, req: ['cabbage'], time: 10000, rewardCoins: 150, rewardExp: 15 },
    'rau xao': { name: 'Rau Xào', levelReq: 1, req: ['cabbage', 'pepper'], time: 12000, rewardCoins: 180, rewardExp: 18 },
    'banh mi': { name: 'Bánh Mì', levelReq: 1, req: ['pepper'], time: 8000, rewardCoins: 100, rewardExp: 10 },
    'salad': { name: 'Salad Tươi', levelReq: 1, req: ['lettuce', 'pepper'], time: 10000, rewardCoins: 160, rewardExp: 16 },
    'bo luc lac': { name: 'Bò Lúc Lắc', levelReq: 3, req: ['beef', 'lettuce', 'chili_sauce'], time: 15000, rewardCoins: 480, rewardExp: 45 },
    'kho ga': { name: 'Khô Gà Lá Chanh 💥', levelReq: 5, req: ['chicken', 'chili_sauce', 'pepper'], time: 20000, rewardCoins: 800, rewardExp: 80 }
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

        if (!data[userId]) {
            data[userId] = {
                job: 'Chef',
                level: 1,
                exp: 0,
                coins: 1000,
                isNewbie: true,
                inventory: {
                    meats: { chicken: 5, beef: 5, pork: 5, duck: 5 },
                    veggies: { cabbage: 5, lettuce: 5, water_spinach: 5, garland_chrysanthemum: 5 },
                    spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 }
                }
            };
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }

        const player = data[userId];

        if (player.isNewbie) {
            const tutorialEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔰 HƯỚNG DẪN TÂN THỦ ĐẦU BẾP')
                .setDescription(
                    `Chào mừng bạn đến với căn bếp!\n\n` +
                    `📖 **Bước 1:** Gõ \`mrecipe\` để nhớ công thức.\n` +
                    `🍳 **Bước 2:** Gõ \`mcook rau luoc\` để bắt đầu.\n` +
                    `🎯 **Nhiệm vụ:** Thời gian đếm ngược sẽ chạy ngay lập tức! Bạn phải chọn đúng các nguyên liệu bằng nút bấm bên dưới trước khi hết giờ!`
                );

            player.isNewbie = false;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));

            await message.reply({ embeds: [tutorialEmbed] });
            return;
        }

        const recipeKey = (await args.rest('string').catch(() => '')).toLowerCase().trim();
        const recipe = RECIPES[recipeKey];

        if (!recipe) {
            await message.reply('❌ Món ăn không tồn tại! Gõ `mrecipe` để xem công thức.');
            return;
        }

        if ((player.level || 1) < recipe.levelReq) {
            await message.reply(`🔒 Bạn cần **Level ${recipe.levelReq}** để nấu món **${recipe.name}**!`);
            return;
        }

        // Tạo danh sách nút nguyên liệu (Bao gồm nguyên liệu đúng + 2 nguyên liệu nhiễu)
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
                `🎯 **Hãy chọn đủ các nguyên liệu cần thiết bằng nút bấm bên dưới!**\n\n` +
                `📥 **Đã chọn:** *(Chưa chọn nguyên liệu nào)*`
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
                await interaction.reply({ content: '❌ Đây không phải món ăn của bạn!', ephemeral: true });
                return;
            }

            const chosenItem = interaction.customId.replace('ing_', '');

            if (!selectedItems.includes(chosenItem)) {
                selectedItems.push(chosenItem);
            }

            // Kiểm tra xem đã chọn đủ tất cả nguyên liệu đúng chưa
            const isCompleted = requiredItems.every(item => selectedItems.includes(item));

            if (isCompleted) {
                collector.stop('completed');

                let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
                updatedData[userId].coins = (updatedData[userId].coins || 0) + recipe.rewardCoins;
                updatedData[userId].exp = (updatedData[userId].exp || 0) + recipe.rewardExp;
                fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle(`🎉 Hoàn thành món: ${recipe.name}!`)
                    .setDescription(
                        `Bạn đã chọn chuẩn xác các nguyên liệu!\n` +
                        `💰 **Nhận được:** \`+${recipe.rewardCoins} Coins\`\n` +
                        `⭐ **Kinh nghiệm:** \`+${recipe.rewardExp} EXP\``
                    );

                await interaction.update({ embeds: [successEmbed], components: [] });
            } else {
                // Cập nhật danh sách nguyên liệu đã chọn lên Embed
                const selectedLabels = selectedItems.map(k => ITEM_NAMES[k]).join(', ');
                const updatedEmbed = EmbedBuilder.from(cookingEmbed).setDescription(
                    `⏱️ Thời gian: **${recipe.time / 1000} giây**!\n` +
                    `🎯 **Hãy chọn đủ các nguyên liệu cần thiết bằng nút bấm bên dưới!**\n\n` +
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
                    .setDescription(`Bạn không chọn đủ nguyên liệu kịp thời gian!\n💸 **Bị trừ:** \`${penalty} Coins\`.`);

                await response.edit({ embeds: [failEmbed], components: [] }).catch(() => {});
            }
        });
    }
}
