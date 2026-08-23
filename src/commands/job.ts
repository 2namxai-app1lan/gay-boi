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
    name: 'job',
    aliases: ['mjob', 'jobs'],
    description: 'Select your job at "Hết Khô Gà" Restaurant.'
})
export class JobCommand extends Command {
    public override async messageRun(message: Message) {
        const file = path.join(process.cwd(), 'src', 'data', 'players.json');

        if (!fs.existsSync(file)) {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, '{}');
        }

        const userId = message.author.id;

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('waiter')
                .setLabel('🍵 Waiter (Bồi Bàn)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('chef')
                .setLabel('🍳 Chef (Đầu Bếp)')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('receptionist')
                .setLabel('📋 Receptionist (Lễ Tân)')
                .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('🏪 "Hết Khô Gà" Restaurant Recruitment')
            .setDescription(
                'Welcome to **"Hết Khô Gà" Restaurant**! 🐔❌\n' +
                'Choose your position below to start working:\n\n' +
                '🍵 **Waiter (Bồi Bàn)**: Serving customers & table cleanup.\n' +
                '🍳 **Chef (Đầu Bếp)**: Cooking delicious meals.\n' +
                '📋 **Receptionist (Lễ Tân)**: Welcoming and helping guests.'
            )
            .setFooter({ text: 'Click a button below to select your job!' });

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

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

            let currentData: Record<string, any> = {};
            try {
                const raw = fs.readFileSync(file, 'utf8').trim();
                currentData = raw ? JSON.parse(raw) : {};
            } catch {
                currentData = {};
            }

            const playerData = currentData[userId] || {};

            // 🗺️ Ánh xạ ID nút bấm thành tên Job chuẩn hóa (Viết hoa chữ cái đầu)
            const jobMap: Record<string, string> = {
                'waiter': 'Waiter',
                'chef': 'Chef',
                'receptionist': 'Receptionist'
            };

            const selectedJob = jobMap[interaction.customId] || 'Unemployed';

            // Kiểm tra xem người chơi đã có job hợp lệ chưa
            if (playerData.job && playerData.job.toLowerCase() !== 'unemployed') {
                await interaction.reply({
                    content: `⏳ **Bạn đang trong hợp đồng làm việc!** Chức vụ hiện tại: **${playerData.job.toUpperCase()}**.`,
                    ephemeral: true
                });
                return;
            }

            const inventory = playerData.inventory || {
                meats: { chicken: 5, beef: 2, pork: 3, duck: 0 },
                veggies: { cabbage: 5, lettuce: 5, water_spinach: 3, garland_chrysanthemum: 0 },
                spices: { pepper: 5, chili_sauce: 5, ketchup: 5, fish_sauce: 5 },
                coupons: 0
            };

            // 🎁 Tặng 1 Coupon tân thủ cho lần nhận việc thành công
            inventory.coupons = (inventory.coupons || 0) + 1;
            const extraMessage = '\n🎟️ **Tân thủ quà tặng:** Bạn đã nhận được **1 Coupon mua hàng FREE**!';

            // 💾 Lưu thông tin đã chuẩn hóa vào JSON
            currentData[userId] = {
                ...playerData,
                job: selectedJob,
                lastJobChange: Date.now(),
                inventory: inventory
            };

            fs.writeFileSync(file, JSON.stringify(currentData, null, 2));

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map((button: ButtonBuilder) => ButtonBuilder.from(button).setDisabled(true))
            );

            await interaction.update({
                content: `🎉 **Chúc mừng!** Bạn đã nhận vị trí **${selectedJob}** tại nhà hàng "Hết Khô Gà"!${extraMessage}`,
                components: [disabledRow]
            });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map((button: ButtonBuilder) => ButtonBuilder.from(button).setDisabled(true))
            );
            await response.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
}
