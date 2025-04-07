import { PrometheusService } from '@/modules/prometheus/prometheus.service';
import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule as PrometheusNestJSModule,
} from '@willsoto/nestjs-prometheus';

const available = [
  PrometheusService,
  makeCounterProvider({
    name: 'reflux_installations_count',
    help: 'Amount of installations of addon (may be unstable).',
  }),
  makeHistogramProvider({
    name: 'reflux_movies_fetch_duration',
    help: 'Request duration of fetching movies content.',
  }),
  makeHistogramProvider({
    name: 'reflux_series_fetch_duration',
    help: 'Request duration of fetching series content.',
  }),
  makeHistogramProvider({
    name: 'reflux_movies_watch_duration',
    help: 'Request duration of generating movies streams.',
  }),
  makeHistogramProvider({
    name: 'reflux_series_watch_duration',
    help: 'Request duration of generating series streams.',
  }),
];

@Module({
  imports: [PrometheusNestJSModule.register()],
  providers: available,
  exports: available,
})
export class PrometheusModule {}
