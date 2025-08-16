import { EventEmitter } from 'node:events';

const emitter = new EventEmitter();

export const onStickerCountUpdated = (listener: (count: number) => void): void => {
	emitter.on('sticker-count-updated', listener);
};

export const emitStickerCountUpdated = (count: number): void => {
	emitter.emit('sticker-count-updated', count);
};