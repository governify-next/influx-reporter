import type { Consumer, EachBatchPayload } from 'kafkajs';
import { saveStates } from './influx.service.js';

export const processStateBatch = async (
    { batch, heartbeat, isRunning, isStale, resolveOffset }: EachBatchPayload,
    consumer: Consumer,
): Promise<void> => {
    if (!isRunning() || isStale() || !batch.messages.length) return;
    const states = batch.messages.map(({ value }) => {
        if (value === null) throw new Error('Kafka state message has no value');
        return JSON.parse(value.toString('utf8'));
    });
    await heartbeat();
    await saveStates(states);
    await heartbeat();
    if (!isRunning() || isStale()) return;
    const offset = batch.messages.at(-1)!.offset;
    await consumer.commitOffsets([
        {
            topic: batch.topic,
            partition: batch.partition,
            offset: (BigInt(offset) + 1n).toString(),
        },
    ]);
    resolveOffset(offset);
};
