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
    name: 'profile',
    aliases: ['mprofile', 'p'],
    description: 'View your profile or another user profile and restaurant inventory.'
})
export class ProfileCommand extends Command {
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

        // 🎯 Lấy người dùng được tag, nếu không tag ai thì lấy người gõ lệnh
        const targetUser = message.mentions.users.first() || message.author;
        const userId = targetUser.id;

        // 🔄 Nếu người được tag chưa có trong file, tự động khởi tạo hồ sơ mặc định
        if (!data[userId]) {
            data[userId] = {
                job: 'Unemployed',
                level: 1,
                exp: 0,
                coins: 1000,
                dishesCooked: 0,
                tablesServed: 0,
                guestsWelcomed: 0,
                lastJobChange: 0,
                inventory: {
                    meats: { chicken: 5, beef: 2, pork: 3, duck: 0 },
                    veggies: { cabbage: 5, lettuce: 5, water_spinach: 3, garland_chrysanthemum: 0 },
                    spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 },
                    coupons: 0
                }
            };
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }

        const player = data[userId];

        const inventory = player.inventory || {};
        const meats = inventory.meats || {};
        const veggies = inventory.veggies || {};
        const spices = inventory.spices || {};
        const coupons = inventory.coupons || 0;

        // Hàm hỗ trợ tạo Embed hiển thị theo tab kho 📦
        const createProfileEmbed = (category: 'meats' | 'veggies' | 'spices') => {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`👤 Hồ Sơ Nhân Viên - ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '💼 Chức vụ', value: `\`${(player.job || 'Unemployed').toUpperCase()}\``, inline: true },
                    { name: '⭐ Cấp độ (Level)', value: `\`LV.${player.level || 1}\` (${player.exp || 0} EXP)`, inline: true },
                    { name: '💰 Ví tiền', value: `\`${player.coins || 0}\` Coins`, inline: true },
                    { name: '🎟️ Coupon Free', value: `\`${coupons}\` thẻ`, inline: true }
                );

            if (category === 'meats') {
                embed.addFields({
                    name: '🥩 Kho Thịt (Meats)',
                    value: `🐔 **Gà (Chicken):** \`${meats.chicken || 0}\`
🥩 **Bò (Beef):** \`${meats.beef || 0}\`
🐖 **Heo (Pork):** \`${meats.pork || 0}\`
🦆 **Vịt (Duck):** \`${meats.duck || 0}\``,
                    inline: false
                });
            } else if (category === 'veggies') {
                embed.addFields({
                    name: '🥦 Kho Rau (Veggies)',
                    value: `🥬 **Bắp cải (Cabbage):** \`${veggies.cabbage || 0}\`
🥗 **Xà lách (Lettuce):** \`${veggies.lettuce || 0}\`
🌱 **Rau muống (Water Spinach):** \`${veggies.water_spinach || 0}\`
🌿 **Tần ô (Garland Chrysanthemum):** \`${veggies.garland_chrysanthemum || 0}\``,
                    inline: false
                });
            } else if (category === 'spices') {
                embed.addFields({
                    name: '🧂 Kho Gia Vị (Spices)',
                    value: `🌶️ **Tiêu (Pepper):** \`${spices.pepper || 0}\`
🌶️ **Tương ớt (Chili Sauce):** \`${spices.chili_sauce || 0}\`
🍅 **Tương cà (Ketchup):** \`${spices.ketchup || 0}\`
🐟 **Nước mắm (Fish Sauce):** \`${spices.fish_sauce || 0}\``,
                    inline: false
                });
            }

            embed.setFooter({ text: 'Bấm nút bên dưới để chuyển kho hàng | Hạn tương tác: 60s' });
            return embed;
        };

        // Tạo 3 nút bấm phân loại kho hàng 🔘
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('tab_meats')
                .setLabel('🥩 Kho Thịt')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('tab_veggies')
                .setLabel('🥦 Kho Rau')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('tab_spices')
                .setLabel('🧂 Kho Gia Vị')
                .setStyle(ButtonStyle.Secondary)
        );

        const response = await message.reply({
            embeds: [createProfileEmbed('meats')],
            components: [row]
        });

        // Tạo Collector lắng nghe chuyển tab ⏱️
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ 
                    content: '❌ Bạn không phải là người gọi menu này!', 
                    ephemeral: true 
                });
                return;
            }

            let selectedCategory: 'meats' | 'veggies' | 'spices' = 'meats';
            if (interaction.customId === 'tab_veggies') selectedCategory = 'veggies';
            if (interaction.customId === 'tab_spices') selectedCategory = 'spices';

            await interaction.update({
                embeds: [createProfileEmbed(selectedCategory)],
                components: [row]
            });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
            );
            await response.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
}
