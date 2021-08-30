export type ProfilerStatsItem = {
  worker: boolean;
  pid: number;
  pluginName: string;
  listenerName: string;
  event: string;
  duration: number;
  start: number;
  end: number;
};

export type PluginStatsItem = ProfilerStatsItem & {
  filePath: string;
};

export enum LoadState {
  empty = 'empty',
  loading = 'loading',
  loaded = 'loaded',
  error = 'error',
}

export type Source = {
  filePath: string;
  rowsCount: number;
  loadState: LoadState;
  fetchError: string | null;
};
