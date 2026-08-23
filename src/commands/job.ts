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

        // Tạo nút bấm chọn công việc 🔘
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
            .setDescription('Welcome to **"Hết Khô Gà" Restaurant**! 🐔❌\nChoose your position below to start working:\n\n🍵 **Waiter (Bồi Bàn)**: Serve customers and clean tables.\n🍳 **Chef (Đầu Bếp)**: Cook delicious meals.\n📋 **Receptionist (Lễ Tân)**: Welcome guests.')
            .setFooter({ text: 'Click a button below to select your job!' });

        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // Lắng nghe sự kiện bấm nút ⏱️
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            // Chỉ cho phép người gõ lệnh tương tác 🙅‍♂️
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ 
                    content: '❌ Bạn không phải là người gọi menu này!', 
                    ephemeral: true 
                });
                return;
            }

            // Đọc lại dữ liệu mới nhất từ file JSON 📂
            let currentData: Record<string, any> = {};
            try {
                const raw = fs.readFileSync(file, 'utf8').trim();
                currentData = raw ? JSON.parse(raw) : {};
            } catch {
                currentData = {};
            }

            const playerData = currentData[userId] || {};

            // Kiểm tra nếu đã có Job 🔒
            if (playerData.job && playerData.job !== 'Unemployed') {
                await interaction.reply({
                    content: `⏳ **Bạn đang trong hợp đồng làm việc!** Chức vụ hiện tại: **${playerData.job.toUpperCase()}**.`,
                    ephemeral: true
                });
                return;
            }

            // Lưu Job mới 💾
            const selectedJob = interaction.customId;
            currentData[userId] = {
                ...playerData,
                job: selectedJob,
                lastJobChange: Date.now()
            };
            fs.writeFileSync(file, JSON.stringify(currentData, null, 2));

            // Vô hiệu hóa tất cả các nút bấm 🛑
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                row.components.map((button: ButtonBuilder) => ButtonBuilder.from(button).setDisabled(true))
            );

            await interaction.update({
                content: `🎉 **Chúc mừng!** Bạn đã nhận vị trí **${selectedJob.toUpperCase()}** tại nhà hàng "Hết Khô Gà"!`,
                components: [disabledRow]
            });
        });
    }
}
