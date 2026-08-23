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
import fs from 'fs';
import path from 'path';

@ApplyOptions<Command.Options>({
    name: 'store',
    aliases: ['mstore', 'shop'],
    description: 'Open the "Hết Khô Gà" restaurant store to buy ingredients or use coupons.'
})
export class StoreCommand extends Command {
    public override async messageRun(message: Message) {
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

        // 🔄 Tự động khởi tạo hồ sơ nếu người chơi chưa có
        if (!data[userId]) {
            data[userId] = {
                job: 'Unemployed',
                level: 1,
                exp: 0,
                coins: 1000,
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

        // 📦 Giao diện cửa hàng
        const storeEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('🛒 Cửa Hàng "Hết Khô Gà"')
            .setDescription(
                `Chào mừng **${message.author.username}** đến với cửa hàng nhà hàng! 🐔\n` +
                `💰 **Số dư hiện tại:** \`${player.coins || 0}\` Coins\n` +
                `🎟️ **Coupon sở hữu:** \`${player.inventory?.coupons || 0}\` thẻ\n\n` +
                'Bấm các nút bên dưới để tiến hành mua nguyên liệu bằng Coins hoặc dùng Coupon đổi quà nhé!'
            )
            .addFields(
                { name: '🥩 Gói Thịt Cơ Bản', value: 'Giá: `200 Coins` (Nhận ngẫu nhiên thịt gà/bò/heo)', inline: true },
                { name: '🥦 Gói Rau Tươi', value: 'Giá: `150 Coins` (Nhận rau củ các loại)', inline: true },
                { name: '🎟️ Đổi Quà Coupon', value: 'Giá: `1 Coupon` (Nhận phần thưởng đặc biệt)', inline: true }
            )
            .setFooter({ text: 'Hạn tương tác cửa hàng: 60 giây' });

        // 🔘 Tạo các nút mua sắm
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('buy_meat')
                .setLabel('🥩 Mua Gói Thịt (200c)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buy_veg')
                .setLabel('🥦 Mua Gói Rau (150c)')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('use_coupon')
                .setLabel('🎟️ Dùng Coupon Đổi Quà')
                .setStyle(ButtonStyle.Secondary)
        );

        const response = await message.reply({
            embeds: [storeEmbed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            // 🛡️ Chỉ người gọi lệnh mới được mua hàng trong store của họ
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ 
                    content: '❌ Đây không phải là cửa hàng của bạn!', 
                    ephemeral: true 
                });
                return;
            }

            let updatedData = JSON.parse(fs.readFileSync(file, 'utf8'));
            let currentPlayer = updatedData[userId];
            let messageReply = '';

            if (interaction.customId === 'buy_meat') {
                const cost = 200;
                if ((currentPlayer.coins || 0) < cost) {
                    await interaction.reply({ content: '❌ Bạn không đủ `200 Coins` để mua gói thịt này!', ephemeral: true });
                    return;
                }
                currentPlayer.coins -= cost;
                currentPlayer.inventory.meats.chicken = (currentPlayer.inventory.meats.chicken || 0) + 2;
                currentPlayer.inventory.meats.beef = (currentPlayer.inventory.meats.beef || 0) + 1;
                messageReply = '🎉 Bạn đã mua thành công **1 Gói Thịt** (-200 Coins)!';
            } 
            else if (interaction.customId === 'buy_veg') {
                const cost = 150;
                if ((currentPlayer.coins || 0) < cost) {
                    await interaction.reply({ content: '❌ Bạn không đủ `150 Coins` để mua gói rau này!', ephemeral: true });
                    return;
                }
                currentPlayer.coins -= cost;
                currentPlayer.inventory.veggies.cabbage = (currentPlayer.inventory.veggies.cabbage || 0) + 2;
                currentPlayer.inventory.veggies.lettuce = (currentPlayer.inventory.veggies.lettuce || 0) + 2;
                messageReply = '🎉 Bạn đã mua thành công **1 Gói Rau Tươi** (-150 Coins)!';
            } 
            else if (interaction.customId === 'use_coupon') {
                const coupons = currentPlayer.inventory.coupons || 0;
                if (coupons <= 0) {
                    await interaction.reply({ content: '❌ Bạn không có chiếc **Coupon Free** nào để đổi!', ephemeral: true });
                    return;
                }
                currentPlayer.inventory.coupons -= 1;
                currentPlayer.coins += 500; // Thưởng nóng 500 xu khi dùng coupon
                messageReply = '🎁 Bạn đã dùng **1 Coupon** và nhận được phần thưởng **500 Coins** vào ví!';
            }

            // Lưu lại dữ liệu mới vào file JSON
            fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));

            // Cập nhật lại số dư trên Embed sau khi mua
            const refreshedEmbed = EmbedBuilder.from(storeEmbed)
                .setDescription(
                    `Chào mừng **${message.author.username}** đến với cửa hàng nhà hàng! 🐔\n` +
                    `💰 **Số dư hiện tại:** \`${currentPlayer.coins}\` Coins\n` +
                    `🎟️ **Coupon sở hữu:** \`${currentPlayer.inventory.coupons}\` thẻ\n\n` +
                    `✅ ${messageReply}`
                );

            await interaction.update({ embeds: [refreshedEmbed] });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
            );
            await response.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
}
