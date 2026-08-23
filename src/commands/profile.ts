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

        // 🔄 Nếu người được tag chưa có trong file, tự động khởi tạo hồ sơ mặc định (Thất nghiệp)
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
        const jobName = (player.job || 'Unemployed').toLowerCase();
        const isUnemployed = jobName === 'unemployed';

        // 🛑 TRƯỜNG HỢP THẤT NGHIỆP: Chỉ hiển thị thông báo ngắn gọn
        if (isUnemployed) {
            const unemployedEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(`👤 Hồ Sơ Nhân Viên - ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setDescription('❌ **Bạn đang thất nghiệp!** Hãy gõ lệnh `mjob` để kiếm việc làm tại nhà hàng ngay nhé. 🐔');

            await message.reply({ embeds: [unemployedEmbed] });
            return;
        }

        const inventory = player.inventory || {};
        const coupons = inventory.coupons || 0;

        // 🛠️ HÀM TẠO EMBED DỰA TRÊN TỪNG NGHỀ VÀ SUB-TAB
        const createJobProfileEmbed = (subTab: string) => {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`👤 Hồ Sơ Nhân Viên - ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '💼 Chức vụ', value: `\`${player.job.toUpperCase()}\``, inline: true },
                    { name: '⭐ Cấp độ (Level)', value: `\`LV.${player.level || 1}\` (${player.exp || 0} EXP)`, inline: true },
                    { name: '💰 Ví tiền', value: `\`${player.coins || 0}\` Coins`, inline: true },
                    { name: '🎟️ Coupon Free', value: `\`${coupons}\` thẻ`, inline: true }
                );

            // Phân loại nội dung hiển thị theo nghề nghiệp
            if (jobName === 'chef') {
                const meats = inventory.meats || {};
                const veggies = inventory.veggies || {};
                const spices = inventory.spices || {};

                if (subTab === 'chef_meats') {
                    embed.addFields({
                        name: '🥩 Kho Thịt (Meats)',
                        value: `🐔 **Gà (Chicken):** \`${meats.chicken || 0}\`\n🥩 **Bò (Beef):** \`${meats.beef || 0}\`\n🐖 **Heo (Pork):** \`${meats.pork || 0}\`\n🦆 **Vịt (Duck):** \`${meats.duck || 0}\``,
                        inline: false
                    });
                } else if (subTab === 'chef_veggies') {
                    embed.addFields({
                        name: '🥦 Kho Rau (Veggies)',
                        value: `🥬 **Bắp cải (Cabbage):** \`${veggies.cabbage || 0}\`\n🥗 **Xà lách (Lettuce):** \`${veggies.lettuce || 0}\`\n🌱 **Rau muống:** \`${veggies.water_spinach || 0}\`\n🌿 **Tần ô:** \`${veggies.garland_chrysanthemum || 0}\``,
                        inline: false
                    });
                } else {
                    embed.addFields({
                        name: '🧂 Kho Gia Vị (Spices)',
                        value: `🌶️ **Tiêu:** \`${spices.pepper || 0}\`\n🌶️ **Tương ớt:** \`${spices.chili_sauce || 0}\`\n🍅 **Tương cà:** \`${spices.ketchup || 0}\`\n🐟 **Nước mắm:** \`${spices.fish_sauce || 0}\``,
                        inline: false
                    });
                }
            } else if (jobName === 'waiter') {
                if (subTab === 'waiter_tables') {
                    embed.addFields({ name: '🪑 Bàn Đang Phục Vụ', value: 'Trạng thái: Đang chuẩn bị phục vụ khách.\n• Bàn 1: Trống\n• Bàn 2: Đang dùng bữa', inline: false });
                } else if (subTab === 'waiter_orders') {
                    embed.addFields({ name: '🍲 Món Chờ Mang Ra', value: '• Đang có `0` món ăn chờ phục vụ khách.', inline: false });
                } else {
                    embed.addFields({ name: '🪙 Tiền Típ Thu Được', value: `Tổng tiền típ tích lũy: \`${player.tablesServed || 0}\` Coins`, inline: false });
                }
            } else if (jobName === 'receptionist') {
                if (subTab === 'recept_lobby') {
                    embed.addFields({ name: '🛋️ Khách Chờ Ở Sảnh', value: 'Số lượng khách đang đợi xếp bàn: `3` nhóm.', inline: false });
                } else if (subTab === 'recept_vip') {
                    embed.addFields({ name: '⭐ Đặt Bàn VIP', value: 'Danh sách bàn VIP đặt trước: Không có.', inline: false });
                } else {
                    embed.addFields({ name: '📖 Sổ Tay Đón Khách', value: `Tổng số khách đã chào đón: \`${player.guestsWelcomed || 0}\` lượt.`, inline: false });
                }
            }

            embed.setFooter({ text: 'Bấm nút bên dưới để chuyển tab chức năng | Hạn tương tác: 60s' });
            return embed;
        };

        // 🔘 TẠO 3 NÚT BẤM ĐỘC LẬP TÙY THEO NGHỀ
        let row = new ActionRowBuilder<ButtonBuilder>();

        if (jobName === 'chef') {
            row.addComponents(
                new ButtonBuilder().setCustomId('chef_meats').setLabel('🥩 Kho Thịt').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('chef_veggies').setLabel('🥦 Kho Rau').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('chef_spices').setLabel('🧂 Kho Gia Vị').setStyle(ButtonStyle.Secondary)
            );
        } else if (jobName === 'waiter') {
            row.addComponents(
                new ButtonBuilder().setCustomId('waiter_tables').setLabel('🪑 Bàn Phục Vụ').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('waiter_orders').setLabel('🍲 Món Chờ').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('waiter_tips').setLabel('🪙 Tiền Típ').setStyle(ButtonStyle.Secondary)
            );
        } else if (jobName === 'receptionist') {
            row.addComponents(
                new ButtonBuilder().setCustomId('recept_lobby').setLabel('🛋️ Khách Chờ Sảnh').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('recept_vip').setLabel('⭐ Đặt Bàn VIP').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('recept_notes').setLabel('📖 Sổ Đón Khách').setStyle(ButtonStyle.Secondary)
            );
        }

        const initialTab = jobName === 'chef' ? 'chef_meats' : jobName === 'waiter' ? 'waiter_tables' : 'recept_lobby';

        const response = await message.reply({
            embeds: [createJobProfileEmbed(initialTab)],
            components: [row]
        });

        // ⏱️ COLLECTOR LẮNG NGHE TƯƠNG TÁC NÚT
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            // 🛡️ CHỈ CHÍNH CHỦ mới được quyền bấm nút chuyển tab
            if (interaction.user.id !== targetUser.id) {
                await interaction.reply({ 
                    content: '❌ Đây không phải là bảng hồ sơ của bạn!', 
                    ephemeral: true 
                });
                return;
            }

            await interaction.update({
                embeds: [createJobProfileEmbed(interaction.customId)],
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
