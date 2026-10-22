import { InfluxDBClient, type Point } from '@influxdata/influxdb3-client';
import { bootEnv } from '../config/bootConfig.js';

const client = new InfluxDBClient({
    host: bootEnv.INFLUX_URL,
    token: bootEnv.INFLUX_TOKEN,
    authScheme: 'Bearer',
    database: bootEnv.INFLUX_DATABASE,
    writeOptions: {
        precision: 'ms',
        useV2Api: false,
        acceptPartial: false,
        noSync: false,
    },
});

export const writePoints = async (points: Point[]): Promise<void> => {
    if (!points.length) return;
    await client.write(points);
};
