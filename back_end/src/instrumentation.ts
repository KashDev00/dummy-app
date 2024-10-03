import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {MeterProvider, PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-http';
import {HostMetrics} from "@opentelemetry/host-metrics";

import {RuntimeNodeInstrumentation} from '@opentelemetry/instrumentation-runtime-node';
import {SequelizeInstrumentation} from "opentelemetry-instrumentation-sequelize";
import {HttpInstrumentation} from "@opentelemetry/instrumentation-http";
import {ExpressInstrumentation, ExpressLayerType} from "@opentelemetry/instrumentation-express";

const traceExporter = new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: 'http://parquet:4318/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},

})


const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
        // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        url: 'http://parquet:4318/v1/metrics',
        // an optional object containing custom headers to be sent with each request
        headers: {},
        httpAgentOptions: {},
    }),
    metricProducers: [],
    exportIntervalMillis: 60000
})

const hostMetricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
        // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        url: 'http://parquet:4318/v1/metrics',
        // an optional object containing custom headers to be sent with each request
        headers: {},
        httpAgentOptions: {},
    }),
    metricProducers: [],
    exportIntervalMillis: 60000
})

const hostMetrics = new HostMetrics({
    name: "Dummy Backend",
    meterProvider: new MeterProvider({
        readers: [hostMetricReader],
    })
})

hostMetrics.start();

const instrumentations = [
    getNodeAutoInstrumentations(),
    new RuntimeNodeInstrumentation({
        eventLoopUtilizationMeasurementInterval: 60000,
    }),
    new HttpInstrumentation({
        enabled: true,
        serverName: "Dummy Backend",
    }),
    new ExpressInstrumentation({
        enabled: true,
        requestHook: (span, info) => {

                span.setAttribute(
                    'express.base_url',
                    info.request.baseUrl
                );
        }
    }),
    new SequelizeInstrumentation()
]

const sdk = new NodeSDK({
    serviceName: "Dummy Backend",
    // traceExporter: traceExporter,
    metricReader: metricReader,
    instrumentations: instrumentations,
});

sdk.start();
