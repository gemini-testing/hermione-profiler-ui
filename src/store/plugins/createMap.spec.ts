import _ from 'lodash';

import createMap from './createMap';
import { PluginStatsItem } from './types';

const mkItem = (
  params: Partial<PluginStatsItem> = {}
): PluginStatsItem => ({
  worker: true,
  pid: 1,
  pluginName: 'plg1',
  listenerName: 'on',
  event: 'init',
  duration: 100,
  start: 0,
  end: 100,
  filePath: 'http://host/file.json',
  ...params,
});
const buildSet = (items: Partial<PluginStatsItem>[] = []) =>
  createMap(items.map(mkItem));

const getListenerLevel = (set: ReturnType<typeof buildSet>) => set;

const getEventLevel = (
  set: ReturnType<typeof buildSet>,
  listener = 'on'
) => getListenerLevel(set).map[listener];

const getProcLevel = (
  set: ReturnType<typeof buildSet>,
  event = 'init',
  listener = 'on'
) => getEventLevel(set, listener).map[event];

const getPluginLevel = (
  set: ReturnType<typeof buildSet>,
  event = 'init',
  listener = 'on',
  proc = 'http://host/file.json:1'
) => getProcLevel(set, event, listener).map[proc];

const getCall = (
  set: ReturnType<typeof buildSet>,
  callName: string,
  event = 'init',
  listener = 'on',
  proc = 'http://host/file.json:1'
) => getPluginLevel(set, event, listener, proc).map[callName];

describe('store/plugins/createMap', () => {
  describe('listeners level', () => {
    test('should contain list and map properties', () => {
      const set = buildSet([{}]);
      const level = getListenerLevel(set);

      expect(level).toHaveProperty('list');
      expect(level).toHaveProperty('map');
    });

    test('should contain list of all listeners', () => {
      const set = buildSet([{}]);
      const level = getListenerLevel(set);

      expect(level.list).toEqual(['on']);
    });
  });

  describe('events level', () => {
    test('should contain list of items with required fields from nested level', () => {
      const set = buildSet([{}]);
      const level = getEventLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toMatchObject({
        pid: 1,
        event: 'init',
        filePath: 'http://host/file.json',
        listenerName: 'on',
        worker: true,
        calls: 1,
        waitable: true,
      });
    });

    test('should get max duration of all items of nested level', () => {
      const set = buildSet([
        {
          filePath: 'file1',
          event: 'some',
          duration: 10,
        },
        {
          filePath: 'file2',
          event: 'some',
          duration: 30,
        },
        {
          filePath: 'file3',
          event: 'some',
          duration: 5,
        },
      ]);
      const level = getEventLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toHaveProperty('duration', 30);
    });
  });

  describe('process level', () => {
    test('should contain list and map properties', () => {
      const set = buildSet([{}]);
      const level = getProcLevel(set);

      expect(level).toHaveProperty('list');
      expect(level).toHaveProperty('map');
    });

    test('should contain map with uniq process names', () => {
      const set = buildSet([{}]);
      const level = getProcLevel(set);

      expect(_.keys(level.map)).toEqual(['http://host/file.json:1']);
    });

    test('should contain list of items with required fields from nested level', () => {
      const set = buildSet([{}]);
      const level = getProcLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toMatchObject({
        pid: 1,
        event: 'init',
        filePath: 'http://host/file.json',
        listenerName: 'on',
        worker: true,
        calls: 1,
        waitable: true,
      });
    });

    test('should calc sum of durations for non-waitable events', () => {
      const set = buildSet([
        { event: 'unknown', duration: 10 },
        { event: 'unknown', duration: 20 },
      ]);
      const level = getProcLevel(set, 'unknown');

      expect(level.list).toHaveLength(1);
      expect(level.list[0].duration).toBe(30);
    });

    test('should calc ranges of durations for waitable events', () => {
      const set = buildSet([
        { event: 'init', start: 50, end: 80 },
        { event: 'init', start: 70, end: 90 },
      ]);
      const level = getProcLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0].duration).toBe(40);
    });
  });

  describe('plugin level', () => {
    test('should contain list and map fields', () => {
      const set = buildSet([
        { pluginName: 'plg1' },
        { pluginName: 'plg1' },
      ]);
      const level = getPluginLevel(set);

      expect(level).toHaveProperty('list');
      expect(level).toHaveProperty('map');
    });

    test('should have list of items with required fields from nested level', () => {
      const set = buildSet([
        { pluginName: 'plg1' },
        { pluginName: 'plg1' },
      ]);
      const level = getPluginLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toMatchObject({
        pluginName: 'plg1',
        pid: 1,
        filePath: 'http://host/file.json',
        listenerName: 'on',
        event: 'init',
        worker: true,
      });
    });

    test('should calc sum of durations for non-waitable events', () => {
      const set = buildSet([
        { event: 'unknown', pluginName: 'plg1', duration: 10 },
        { event: 'unknown', pluginName: 'plg1', duration: 10 },
      ]);
      const level = getPluginLevel(set, 'unknown');

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toHaveProperty('duration', 20);
    });

    test('should calc ranges of durations for waitable events', () => {
      const set = buildSet([
        { event: 'init', pluginName: 'plg1', start: 10, end: 15 },
        { event: 'init', pluginName: 'plg1', start: 20, end: 25 },
      ]);
      const level = getPluginLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toHaveProperty('duration', 15);
    });

    test('should calc number of calls', () => {
      const set = buildSet([{}, {}, {}]);
      const level = getPluginLevel(set);

      expect(level.list).toHaveLength(1);
      expect(level.list[0]).toHaveProperty('calls', 3);
    });

    test('should contain map with uniq call names', () => {
      const set = buildSet([{}, {}]);
      const level = getPluginLevel(set);

      expect(level.map).toHaveProperty('plg1 (1)');
      expect(level.map).toHaveProperty('plg1 (2)');
    });
  });

  describe('calls level', () => {
    test('should have required fileds from origin item', () => {
      const set = buildSet([{}]);
      const call = getCall(set, 'plg1 (1)');

      expect(call).toMatchObject({
        worker: true,
        pid: 1,
        pluginName: 'plg1',
        listenerName: 'on',
        event: 'init',
        duration: 100,
        start: 0,
        end: 100,
        filePath: 'http://host/file.json',
      });
    });

    test('should have title based on call count', () => {
      const set = buildSet([{}]);
      const call = getCall(set, 'plg1 (1)');

      expect(call).toHaveProperty('title', 'plg1 (1)');
    });

    test('should have duration range based on start, end points', () => {
      const set = buildSet([{ start: 10, end: 30 }]);
      const call = getCall(set, 'plg1 (1)');

      expect(call).toHaveProperty('range', [0, 20]);
    });
  });
});
