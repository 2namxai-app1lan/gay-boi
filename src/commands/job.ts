// Trong phần xử lý collector khi bấm nút (interaction):
collector.on('collect', async (interaction) => {
    // Chỉ cho phép người gõ lệnh bấm nút
    if (interaction.user.id !== message.author.id) {
        await interaction.reply({ content: '❌ Bạn không phải là người gõ lệnh này!', ephemeral: true });
        return;
    }

    const userId = interaction.user.id;
    const player = data[userId];

    // FIX LỖI CHỌN LẠI: Kiểm tra nếu đã có job
    if (player && player.job !== 'Unemployed') {
        await interaction.reply({
            content: `⏳ **Bạn đang trong hợp đồng làm việc!** Chức vụ hiện tại: **${player.job.toUpperCase()}**.`,
            ephemeral: true
        });
        return;
    }

    // Gán job mới dựa vào customId của button
    const selectedJob = interaction.customId; // 'chef', 'waiter', hoặc 'receptionist'
    
    player.job = selectedJob;
    player.lastJobChange = Date.now();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));

    // FIX LỖI DISABLE BUTTONS: Khóa toàn bộ các nút bấm sau khi đã chọn
    const disabledRows = responseMessage.components.map((row) => {
        return {
            type: row.type,
            components: row.components.map((component) => ({
                ...component.data,
                disabled: true
            }))
        };
    });

    await interaction.update({
        content: `🎉 **Chúc mừng!** Bạn đã trở thành **${selectedJob.toUpperCase()}** tại nhà hàng "Hết Khô Gà"!`,
        components: disabledRows
    });
});
