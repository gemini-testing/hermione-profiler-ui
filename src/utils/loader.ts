import EventEmitter from 'events';

import oboe from 'oboe';

enum Events {
  chunk = 'chunk',
  error = 'error',
  complete = 'complete',
  start = 'start',
}

interface IFileLoader<T> extends NodeJS.EventEmitter {
  on(event: `${Events.chunk}`, cb: (items: T[]) => void): this;
  on(event: `${Events.error}`, cb: (msg: string) => void): this;
  on(event: `${Events.start}`, cb: () => void): this;
  on(event: `${Events.complete}`, cb: () => void): this;
}

export const loadFile = <T>(
  filePath: string,
  maxBufferSize = 100
) => {
  const emitter: IFileLoader<T> = new EventEmitter();
  const stream = oboe(filePath);
  let hasErr = false;
  let buffer: T[] = [];
  const emitData = () => {
    emitter.emit(Events.chunk, buffer.concat());
    buffer = [];
  };

  stream
    .node('root.*', (node: T) => {
      buffer.push(node);

      if (buffer.length === maxBufferSize) {
        emitData();
      }
    })
    .on('start', () => emitter.emit(Events.start))
    .fail((err) => {
      const msg = err.body || err.thrown?.message || String(err);

      emitter.emit('error', msg);
      hasErr = true;
    })
    .done(() => {
      if (buffer.length > 0) {
        emitData();
      }

      if (!hasErr) {
        emitter.emit(Events.complete);
      }
    });

  return emitter;
};
