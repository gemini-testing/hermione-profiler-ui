import * as utils from './utils';

describe('store/plugins/utils', () => {
  describe('isWaitableEvent', () => {
    ['startRunner', 'endRunner', 'init'].forEach((event) => {
      it(`should return true for "${event}"`, () => {
        expect(utils.isEventWaitable(event)).toBe(true);
      });
    });

    it('should return false if event is not in the list of waitable events', () => {
      expect(utils.isEventWaitable('some')).toBe(false);
    });
  });

  describe('calcDuration', () => {
    it('should get duration by range between min and max of all items', () => {
      const duration = utils.calcDuration([
        { start: 5, end: 10 },
        { start: 6, end: 7 },
        { start: 7, end: 15 },
      ]);

      expect(duration).toEqual(10);
    });
  });
});
