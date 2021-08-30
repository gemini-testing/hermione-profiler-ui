import _ from 'lodash';

import { PluginStatsItem } from './types';
import * as utils from './utils';

export default function createMap(items: PluginStatsItem[]) {
  return buildListenerLevel(items);
}

function buildListenerLevel(items: PluginStatsItem[]) {
  const listenersMap = buildListenersMap(items);
  const list = _.keys(listenersMap);

  return {
    list,
    map: listenersMap,
  };
}

function buildListenersMap(items: PluginStatsItem[]) {
  const grouped = _.groupBy(items, 'listenerName');

  return _.mapValues(grouped, buildEventsLevel);
}

function buildEventsLevel(items: PluginStatsItem[]) {
  const eventsMap = buildEventsMap(items);
  const list = _.values(eventsMap).map(({ list }) => {
    const [first] = list;
    const max = _.maxBy(list, 'duration');

    return {
      duration: max?.duration || 0,
      numberOfProcesses: list.length,
      event: first.event,
      listenerName: first.listenerName,
      pid: first.pid,
      filePath: first.filePath,
      calls: _.get(max, 'calls', 0),
      worker: first.worker,
      waitable: first.waitable,
    };
  });

  return {
    list,
    map: eventsMap,
  };
}

function buildEventsMap(items: PluginStatsItem[]) {
  const grouped = _.groupBy(items, 'event');

  return _.mapValues(grouped, buildProcsLevel);
}

function buildProcsLevel(items: PluginStatsItem[]) {
  const procMap = buildProcMap(items);
  const list = _.values(procMap).map(({ list, map }) => {
    const [first] = list;
    const duration = first.waitable
      ? utils.calcDuration(_.values(map))
      : _.sumBy(list, 'duration');

    return {
      duration,
      pid: first.pid,
      event: first.event,
      filePath: first.filePath,
      listenerName: first.listenerName,
      worker: first.worker,
      calls: _.sumBy(list, 'calls'),
      waitable: first.waitable,
    };
  });

  return {
    list,
    map: procMap,
  };
}

function buildProcMap(items: PluginStatsItem[]) {
  const group = _.groupBy(
    items,
    ({ filePath, pid }) => `${filePath}:${pid}`
  );

  return _.mapValues(group, buildPluginsLevel);
}

function buildPluginsLevel(items: PluginStatsItem[]) {
  return {
    list: buildCallsList(items),
    map: buildCallsMap(items),
  };
}

function buildCallsList(items: PluginStatsItem[]) {
  const group = _.groupBy(items, 'pluginName');
  const reduced = _.mapValues(group, (items) => {
    const [first] = items;
    const waitable = utils.isEventWaitable(first.event);
    const duration = waitable
      ? utils.calcDuration(items)
      : _.sumBy(items, 'duration');

    return {
      duration,
      calls: items.length,
      pluginName: first.pluginName,
      pid: first.pid,
      filePath: first.filePath,
      listenerName: first.listenerName,
      event: first.event,
      worker: first.worker,
      waitable,
    };
  });

  return _.values(reduced);
}

function buildCallsMap(items: PluginStatsItem[]) {
  const pluginsGroup = _.groupBy(items, 'pluginName');
  const min = _.minBy(items, 'start')?.start || 0;
  const pluginsGroupWithRanges = _.mapValues(
    pluginsGroup,
    (items) => {
      return _.orderBy(items, 'start').map((item, idx) => ({
        ...item,
        title: `${item.pluginName} (${idx + 1})`,
        range: [item.start - min, item.end - min],
      }));
    }
  );
  const callsGroup = _.chain(pluginsGroupWithRanges)
    .values()
    .flatten()
    .groupBy('title')
    .value();

  return _.mapValues(callsGroup, ([item]) => item || {});
}
