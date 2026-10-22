import dotenv from 'dotenv';
import path from 'path';

// Load .env file
const envPath = process.env.GOV_BOOT_ENV_PATH || path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const bootEnv = {
    GOV_LOG_LEVEL: process.env.GOV_LOG_LEVEL || 'INFO',
    GOV_SERVICE_NAME: process.env.GOV_SERVICE_NAME || 'UnknownService',
    PORT: process.env.PORT || '3000',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mern_example',
    KAFKA_BOOTSTRAP_SERVERS: process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092',
    KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'governify-influx-reporter',
    KAFKA_CONSUMER_GROUP_ID: process.env.KAFKA_CONSUMER_GROUP_ID || 'governify-influx-reporter',
    STATE_EVENTS_TOPIC: process.env.STATE_EVENTS_TOPIC || 'governify.states.v1',
    INFLUX_URL: process.env.INFLUX_URL || 'http://localhost:8181',
    INFLUX_TOKEN: process.env.INFLUX_TOKEN || '',
    INFLUX_DATABASE: process.env.INFLUX_DATABASE || 'governify-next',
    INFLUX_STATES_MEASUREMENT: process.env.INFLUX_STATES_MEASUREMENT || 'states',
    INFLUX_STATE_METRICS_MEASUREMENT:
        process.env.INFLUX_STATE_METRICS_MEASUREMENT || 'state_metrics',
};
