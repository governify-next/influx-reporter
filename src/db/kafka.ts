import { Kafka, logLevel } from 'kafkajs';
import { bootEnv } from '../config/bootConfig.js';
import { processStateBatch } from '../services/kafka.service.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger().setTag('kafka');

export const kafkaConsumer = new Kafka({
    clientId: bootEnv.KAFKA_CLIENT_ID,
    brokers: bootEnv.KAFKA_BOOTSTRAP_SERVERS.split(',').map((broker) => broker.trim()),
    logLevel: logLevel.ERROR,
}).consumer({
    groupId: bootEnv.KAFKA_CONSUMER_GROUP_ID,
    allowAutoTopicCreation: false,
});

export const connectKafka = async () => {
    try {
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe({
            topics: [bootEnv.STATE_EVENTS_TOPIC],
            fromBeginning: true,
        });
        await kafkaConsumer.run({
            autoCommit: false,
            eachBatchAutoResolve: false,
            eachBatch: (payload) => processStateBatch(payload, kafkaConsumer),
        });
    } catch (error) {
        await kafkaConsumer.disconnect().catch((disconnectError: unknown) => {
            logger.error(
                'Failed to disconnect Kafka consumer after startup failure',
                disconnectError,
            );
        });
        throw error;
    }
};
