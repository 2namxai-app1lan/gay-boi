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

// Danh sách món ăn mẫu để khách ngẫu nhiên gọi
const MENU_ITEMS = [
    { key: 'salad', name: 'Salad Tươi 🥗' },
    { key: 'rau luoc', name: 'Rau Luộc 🥬' },
    { key: 'banh mi', name: 'Bánh Mì 🥖' },
    { key: 'bo luc lac', name: 'Bò Lúc Lắc 🥩' },
    { key: 'ga chien', name: 'Gà Chiên 🍗' }
];

@ApplyOptions<Command.Options>({
    name: 'takeorder',
    aliases: ['mtakeorder', 'Mtakeorder'],
    description: 'Nhận đơn đặt món từ khách hàng tại các bàn.'
})
export class TakeOrderCommand extends Command {
    public override async messageRun(message: Message) {
        const file = path.join(process.cwd(), 'src', 'data', 'players.json');

        let data: Record<string, any> = {};
        if (fs.existsSync(file)) {
            try {
                data = JSON.parse(fs.readFileSync(file, 'utf8'));
            } catch {
                data = {};
            }
        }

        const userId = message.author.id;
        const player = data[userId];

        // Kiểm tra xem người chơi có phải là Waiter không
        if (!player || player.job !== 'Waiter') {
            await message.reply('❌ Lệnh này chỉ dành cho nhân viên **Bồi bàn (Waiter)**!');
            return;
        }

        // Tạo 3 bàn ngẫu nhiên đang chờ gọi món
        const tables = [
            { id: '1', name: '🪑 Bàn 1' },
            { id: '2', name: '🪑 Bàn 2' },
            { id: '3', name: '🪑 Bàn 3' }
        ];

        const row = new ActionRowBuilder<ButtonBuilder>();
        tables.forEach(table => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`table_${table.id}`)
                    .setLabel(table.name)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📝 Danh Sách Bàn Đang Chờ Order')
            .setDescription('Hãy chọn một bàn bên dưới để tiếp nhận đơn đặt món của khách!');

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: '❌ Bạn không thể nhận bàn giúp người khác!', ephemeral: true });
                return;
            }

            const tableId = interaction.customId.replace('table_', '');
            
            // Ngẫu nhiên chọn 1 món khách muốn ăn
            const randomDish = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];

            // Lưu đơn hàng vào danh sách orders trong file JSON
            if (!data['orders']) data['orders'] = [];

            data['orders'].push({
                tableId: tableId,
                dishKey: randomDish.key,
                dishName: randomDish.name,
                waiterId: userId,
                status: 'pending', // pending -> cooked -> served
                createdAt: Date.now()
            });

            fs.writeFileSync(file, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle(`✅ Đã nhận đơn hàng thành công!`)
                .setDescription(
                    `📍 **Vị trí:** Bàn ${tableId}\n` +
                    `🍽️ **Món khách gọi:** ${randomDish.name}\n` +
                    `⏳ **Trạng thái:** Đã chuyển đơn cho Bếp (\`mcook ${randomDish.key}\`) chế biến!`
                );

            await interaction.update({ embeds: [successEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'user') {
                await response.edit({ components: [] }).catch(() => {});
            }
        });
    }
}
