'use strict'

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import * as logsAPI from '@opentelemetry/api-logs'
import {
  LoggerProvider,
  BatchLogRecordProcessor
} from '@opentelemetry/sdk-logs';


import {
    SEMRESATTRS_SERVICE_NAME,
    SEMRESATTRS_SERVICE_VERSION,
  } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';


const logExporter = new OTLPLogExporter();
const loggerProvider = new LoggerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'morphic',
  })
});

loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

logsAPI.logs.setGlobalLoggerProvider(loggerProvider);



const traceExporter = new OTLPTraceExporter();
const sdk = new NodeSDK({
    resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'morphic',
      }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          requireParentSpan: true,
        },
      })
    ],
  });


  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
  
  sdk.start();