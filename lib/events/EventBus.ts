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
    #name : T;

    #sortedList: SortedArray<EventBusEntry<U>>;

    #target: V;

    #ecb: (this:V, e: U) => void;

    constructor(name: T, target: V) {
      this.#name = name;
      this.#ecb = this.eventCallback.bind(this);
      this.#target = target;
      this.#sortedList = new SortedArray<EventBusEntry<U>>(comparator);

      const self = this;

      this.#ecb = function EventCallBack(this: V, ev: U) {
        self.#sortedList.forEach(([, cb]) => cb(ev));
      };

      target.addEventListener(name as any, this.#ecb as any);
    }

    addListener(cb: (e: U) => void, order: number = 0) {
      this.#sortedList.add([order, cb.bind(this.#target)]);
    }

    dispose() {
      window.removeEventListener(this.#name as any, this.#ecb as any);
    }

    private eventCallback(e: U): void {
      this.#sortedList.forEach(([, cb]) => cb(e));
    }
}
