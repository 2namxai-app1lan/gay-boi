import { Listener } from '@sapphire/framework';

export class ReadyListener extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options
	) {
		super(context, {
			...options,
			event: 'clientReady'
		});
	}

	public run() {
		console.log('🟢 CLIENT READY');
	}
}
