import SortedArray from '../util/SortedArray';

type EventBusEntry<U extends Event> = [number, (e: U) => void];

function comparator<U extends Event>(a: EventBusEntry<U>, b: EventBusEntry<U>): number {
  return a[0] - b[0];
}

/**
 * A very simple method of managing event listeners.
 *
 * Callbacks are managed in reverse priority order, allowing lower-order
 * callbacks to be called first.  If two callbacks have the same priority, they
 * are called in the order they are added to the bus.
 */
export default class EventBus<
  T extends string,
  U extends Event = Event,
  V extends EventTarget = EventTarget,
> {
    #sortedList: SortedArray<EventBusEntry<U>>;

    #target?: V;

    #name : T;

    #ecb?: (this:V, e: U) => void;

    constructor(name: T, target?: V) {
      this.#name = name;
      this.#target = target;
      this.#sortedList = new SortedArray<EventBusEntry<U>>(comparator);

      const self = this;

      if (target) {
        this.#ecb = function EventCallBack(this: V, ev: U) {
          self.#sortedList.forEach(([, cb]) => cb(ev));
        };

        target.addEventListener(name, this.#ecb as any);
      }
    }

    addCallback(cb: (e: U) => void, order: number = 0) {
      this.#sortedList.add([order, cb.bind(this.#target)]);
    }

    callback(ev: U) {
      this.#sortedList.forEach(([, cb]) => cb(ev));
    }

    dispatch(ev: U) {
      if (this.#target) {
        this.#target.dispatchEvent(ev);
      } else {
        this.callback(ev);
      }
    }

    dispose() {
      window.removeEventListener(this.#name, this.#ecb as any);
    }
}
