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

        // 🔄 Tự động khởi tạo hồ sơ nếu người chơi chưa có (đảm bảo đủ các trường inventory và coupons)
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

        // 🛡️ Đảm bảo player luôn có đủ object inventory và coupons để tránh lỗi undefined
        const player = data[userId];
        if (!player.inventory) player.inventory = {};
        if (!player.inventory.meats) player.inventory.meats = { chicken: 0, beef: 0, pork: 0, duck: 0 };
        if (!player.inventory.veggies) player.inventory.veggies = { cabbage: 0, lettuce: 0, water_spinach: 0, garland_chrysanthemum: 0 };
        if (!player.inventory.spices) player.inventory.spices = { pepper: 0, chili_sauce: 0, ketchup: 0, fish_sauce: 0 };
        if (typeof player.inventory.coupons !== 'number') player.inventory.coupons = 0;

        // 📦 Giao diện cửa hàng tích hợp đầy đủ các gói nguyên liệu
        const storeEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('🛒 Cửa Hàng "Hết Khô Gà"')
            .setDescription(
                `Chào mừng **${message.author.username}** đến với cửa hàng nhà hàng! 🐔\n` +
                `💰 **Số dư hiện tại:** \`${player.coins}\` Coins\n` +
                `🎟️ **Coupon sở hữu:** \`${player.inventory.coupons}\` thẻ\n\n` +
                'Bấm các nút bên dưới để tiến hành mua sắm nguyên liệu hoặc dùng Coupon đổi quà nhé!'
            )
            .addFields(
                { name: '🥩 Gói Thịt Cơ Bản', value: 'Giá: `200 Coins` (Nhận thêm thịt gà, bò, heo)', inline: true },
                { name: '🥦 Gói Rau Tươi', value: 'Giá: `150 Coins` (Nhận thêm bắp cải, xà lách)', inline: true },
                { name: '🧂 Gói Gia Vị', value: 'Giá: `100 Coins` (Nhận thêm tiêu, tương ớt, nước mắm)', inline: true },
                { name: '🎟️ Đổi Quà Coupon', value: 'Giá: `1 Coupon` (Nhận thưởng 500 Coins)', inline: true }
            )
            .setFooter({ text: 'Hạn tương tác cửa hàng: 60 giây' });

        // 🔘 Tạo các nút mua sắm (chia thành 2 hàng nếu cần hoặc 4 nút trên 1 hàng)
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('buy_meat')
                .setLabel('🥩 Gói Thịt (200c)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buy_veg')
                .setLabel('🥦 Gói Rau (150c)')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('buy_spice')
                .setLabel('🧂 Gói Gia Vị (100c)')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('use_coupon')
                .setLabel('🎟️ Đổi Coupon')
                .setStyle(ButtonStyle.Danger)
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
            
            // Đảm bảo an toàn dữ liệu đọc từ file cũ
            if (!currentPlayer.inventory) currentPlayer.inventory = {};
            if (!currentPlayer.inventory.meats) currentPlayer.inventory.meats = {};
            if (!currentPlayer.inventory.veggies) currentPlayer.inventory.veggies = {};
            if (!currentPlayer.inventory.spices) currentPlayer.inventory.spices = {};
            if (typeof currentPlayer.inventory.coupons !== 'number') currentPlayer.inventory.coupons = 0;

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
            else if (interaction.customId === 'buy_spice') {
                const cost = 100;
                if ((currentPlayer.coins || 0) < cost) {
                    await interaction.reply({ content: '❌ Bạn không đủ `100 Coins` để mua gói gia vị này!', ephemeral: true });
                    return;
                }
                currentPlayer.coins -= cost;
                currentPlayer.inventory.spices.pepper = (currentPlayer.inventory.spices.pepper || 0) + 2;
                currentPlayer.inventory.spices.chili_sauce = (currentPlayer.inventory.spices.chili_sauce || 0) + 1;
                messageReply = '🎉 Bạn đã mua thành công **1 Gói Gia Vị** (-100 Coins)!';
            }
            else if (interaction.customId === 'use_coupon') {
                const coupons = currentPlayer.inventory.coupons || 0;
                if (coupons <= 0) {
                    await interaction.reply({ content: '❌ Bạn không có chiếc **Coupon Free** nào để đổi!', ephemeral: true });
                    return;
                }
                currentPlayer.inventory.coupons -= 1;
                currentPlayer.coins += 500; 
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
