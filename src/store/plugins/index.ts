import { createState, useHookstate } from '@hookstate/core';
import { Untracked } from '@hookstate/untracked';
import _ from 'lodash';

import createMap from './createMap';
import {
  LoadState,
  PluginStatsItem,
  ProfilerStatsItem,
  Source,
} from './types';

const pluginsState = createState({
  sources: [] as Source[],
  items: [] as PluginStatsItem[],
  loadState: LoadState.empty,
  map: {},
});

export const usePluginsState = () => {
  const state = useHookstate(pluginsState);

  state.attach(Untracked);

  const findSource = (filePath: string) => {
    const src = state.sources.find(
      (src) => src.filePath.get() === filePath
    );

    if (!src) {
      throw new Error(`Unable to fine source="${filePath}" in store`);
    }

    return src;
  };

  return {
    state() {
      return state;
    },
    setLoadingState() {
      state.loadState.set(LoadState.loading);
    },
    setLoadedState() {
      state.loadState.set(LoadState.loaded);
    },
    isLoaded() {
      return state.loadState.get() === LoadState.loaded;
    },
    isLoading() {
      return state.loadState.get() === LoadState.loading;
    },
    isAllSourcesLoaded() {
      return state.sources.every((src) =>
        [LoadState.error, LoadState.loaded].includes(
          src.loadState.get()
        )
      );
    },
    addUntrackedSource(filePath: string) {
      Untracked(state.sources).merge([
        {
          rowsCount: 0,
          filePath,
          fetchError: null,
          loadState: LoadState.empty,
        },
      ]);
    },
    setUntrackedLoadingSourceState(filePath: string) {
      const source = findSource(filePath);

      Untracked(source.loadState).set(LoadState.loading);
    },
    setUntrackedErrorSourceState(filePath: string, msg: string) {
      const source = findSource(filePath);

      Untracked(source.loadState).set(LoadState.error);
      Untracked(source.fetchError).set(msg);
    },
    getErrors() {
      return state.sources
        .filter((src) => !_.isEmpty(src.fetchError))
        .map((src) => ({
          filePath: src.filePath.get(),
          error: src.fetchError.get(),
        }));
    },
    setUntrackedCompleteSourceState(filePath: string) {
      const source = findSource(filePath);

      Untracked(source.loadState).set(LoadState.loaded);
    },
    addUntrackedItems(
      filePath: string,
      items: Array<ProfilerStatsItem>
    ) {
      const source = findSource(filePath);
      const data = items.map((item) => ({ ...item, filePath }));

      Untracked(state.items).merge(data);
      Untracked(source.rowsCount).set(
        (count) => count + items.length
      );
    },
    getSources() {
      return state.sources.get();
    },
    shouldFetch() {
      return state.loadState.get() === LoadState.empty;
    },
    buildMap() {
      const map = createMap(Untracked(state.items).get());

      Untracked(state.map).set(map);
    },
    getMap() {
      return Untracked(state.map).get() as ReturnType<
        typeof createMap
      >;
    },
  };
};
