import _ from 'lodash';

const WAITABLE_EVENTS = ['startRunner', 'endRunner', 'init'];

export const isEventWaitable = (event: string) =>
  WAITABLE_EVENTS.includes(event);

export const calcDuration = (
  items: { end: number; start: number }[]
) => {
  const end = _.chain(items).maxBy('end').get('end', 0).value();
  const start = _.chain(items).minBy('start').get('start').value();

  return end - start;
};
