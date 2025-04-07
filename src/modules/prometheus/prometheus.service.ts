import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class PrometheusService {
  public constructor(
    @InjectMetric('reflux_installations_count')
    private readonly installationsCount: Counter<string>,
    @InjectMetric('reflux_movies_fetch_duration')
    private readonly moviesFetchDuration: Histogram,
    @InjectMetric('reflux_series_fetch_duration')
    private readonly seriesFetchDuration: Histogram,
    @InjectMetric('reflux_movies_watch_duration')
    private readonly moviesWatchDuration: Histogram,
    @InjectMetric('reflux_series_watch_duration')
    private readonly seriesWatchDuration: Histogram,
  ) {}

  public increaseInstallationsCount() {
    this.installationsCount.inc();
  }

  public startMoviesFetchDuration() {
    return this.moviesFetchDuration.startTimer();
  }

  public startSeriesFetchDuration() {
    return this.seriesFetchDuration.startTimer();
  }

  public startMoviesWatchDuration() {
    return this.moviesWatchDuration.startTimer();
  }

  public startSeriesWatchDuration() {
    return this.seriesWatchDuration.startTimer();
  }
}
