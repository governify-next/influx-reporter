import { Point } from '@influxdata/influxdb3-client';
import { bootEnv } from '../config/bootConfig.js';
import { writePoints } from '../db/influx.js';

// Fields projected from Registry's JSON-serialized State.
type State = {
    _id: string;
    signatureId: string;
    generationId: string;
    attempt: number;
    date: string;
    startDate: string;
    endDate: string | null;
    consolidated: boolean;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'INDETERMINATE' | null;
    numericExpression: string;
    replacedNumericExpression: string | null;
    comparator: '<' | '>' | '<=' | '>=' | '==' | '!=';
    threshold: number;
    numericExpressionValue: number | null;
    metrics: {
        metricName: string;
        status: 'PENDING' | 'COMPUTED' | 'UNAVAILABLE' | 'FAILED';
        value: number | null;
        errorMessage: string | null;
        metricConfig: {
            event: { eventId: string };
            aggregation: { aggregatorType: string };
        };
    }[];
};

const requireName = (value: string): string => {
    if (typeof value !== 'string' || !value || /[\r\n]/.test(value)) {
        throw new Error('Invalid InfluxDB measurement or tag');
    }
    return value;
};

const requireFields = (fields: Record<string, string | number | boolean>) => {
    if (
        Object.values(fields).some(
            (value) => !['string', 'number', 'boolean'].includes(typeof value),
        )
    ) {
        throw new Error('Invalid InfluxDB field value');
    }
    return fields;
};

export const saveStates = async (states: State[]): Promise<void> => {
    const points: Point[] = [];
    for (const state of states) {
        const timestamp = Date.parse(state.date);
        if (!Number.isFinite(timestamp)) throw new Error(`Invalid state date: ${state.date}`);
        const complianceStatus =
            state.complianceStatus ?? (state.status === 'IN_PROGRESS' ? 'PENDING' : null);
        if (!complianceStatus) throw new Error(`State ${state._id} has no complianceStatus`);
        const point = Point.measurement(requireName(bootEnv.INFLUX_STATES_MEASUREMENT))
            .setTimestamp(timestamp)
            .setTag('signatureId', requireName(state.signatureId))
            .setTag('stateId', requireName(state._id))
            .setTag('stateGenerationId', requireName(state.generationId));
        const valueAvailable = Number.isFinite(state.numericExpressionValue);
        points.push(
            point.copy().setFields(
                requireFields({
                    generationId: state.generationId,
                    attempt: state.attempt,
                    consolidated: state.consolidated,
                    status: state.status,
                    complianceStatus,
                    startDate: state.startDate,
                    endDate: state.endDate ?? '',
                    endDateAvailable: state.endDate != null,
                    numericExpression: state.numericExpression,
                    replacedNumericExpression: state.replacedNumericExpression ?? '',
                    replacedNumericExpressionAvailable: state.replacedNumericExpression != null,
                    comparator: state.comparator,
                    threshold: state.threshold,
                    numericExpressionValue: valueAvailable ? state.numericExpressionValue! : 0,
                    numericExpressionValueAvailable: valueAvailable,
                }),
            ),
        );
        for (const metric of state.metrics) {
            const valueAvailable = Number.isFinite(metric.value);
            points.push(
                point
                    .copy()
                    .setMeasurement(requireName(bootEnv.INFLUX_STATE_METRICS_MEASUREMENT))
                    .setTag('metricName', requireName(metric.metricName))
                    .setFields(
                        requireFields({
                            status: metric.status,
                            value: valueAvailable ? metric.value! : 0,
                            valueAvailable,
                            errorMessage: metric.errorMessage ?? '',
                            errorMessageAvailable: metric.errorMessage != null,
                            eventId: metric.metricConfig.event.eventId,
                            aggregatorType: metric.metricConfig.aggregation.aggregatorType,
                        }),
                    ),
            );
        }
    }
    await writePoints(points);
};
