import { Listener } from '@sapphire/framework';
import { ActivityType } from 'discord.js';

export class ReadyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: 'ready'
        });
    }

    public override run() {
        const client = this.container.client;
        if (!client.user) return;

        // 📝 Danh sách các câu trạng thái độc lạ
        const statusList = [
            { name: 'Thiếu bã mía là mất khô gà ', type: ActivityType.Playing },
            { name: ':3c', type: ActivityType.Playing },
            { name: 'Anh độ mixue ', type: ActivityType.Playing },
            { name: '"Im gay" - Tiến gay ', type: ActivityType.Playing },
            { name: 'đang nghe giao hưởng thank độ, vui lòng không làm phiền ', type: ActivityType.Listening },
            { name: 'mhelp để biết các câu lệnh 📜', type: ActivityType.Playing },
            { name: '"Tao tán mày 1 phát sang Campuchia đấy" - Tôm không gay ', type: ActivityType.Playing }
        ];

        let currentIndex = 0;

        // 🔄 Hàm cập nhật trạng thái
        const updateStatus = () => {
            const currentStatus = statusList[currentIndex];
            client.user?.setActivity(currentStatus.name, { type: currentStatus.type });

            // Chuyển sang câu tiếp theo (vòng lặp)
            currentIndex = (currentIndex + 1) % statusList.length;
        };

        // Kích hoạt ngay lập tức khi bot online
        updateStatus();

        // ⏱️ Cứ mỗi 30 giây (30000 ms) sẽ tự động đổi câu một lần
        setInterval(updateStatus, 10000);

        this.container.logger.info(`🤖 Bot ${client.user.tag} đã sẵn sàng hoạt động với trạng thái xoay vần!`);
    }
}
