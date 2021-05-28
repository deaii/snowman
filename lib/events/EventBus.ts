
/**
 * A very simple method of managing event listeners.
 * 
 * Callbacks are managed in reverse priority order, allowing lower-order 
 * callbacks to be called first.  If two callbacks have the same priority, they
 * are called in the order they are added to the bus.
 */
export class EventBus<T extends string, U extends Event, V extends EventTarget = EventTarget> {

    #name : T;
    #sortedList: [number, (e: U) => void][] = [];
    #target: V;
    #ecb: (this:V, e: U) => void;

    constructor(name: T, target: V) {
        this.#name = name;
        this.#ecb = this.eventCallback.bind(this);
        this.#target = target;

        const self = this;

        this.#ecb = function (this: V, ev: U) {
            self.#sortedList.forEach(([_, cb]) => cb(ev));
        }

        target.addEventListener(name as any, this.#ecb as any);
    }

    addListener(cb: (e: U) => void, order: number = 0) {
        let insertIndex = this.#sortedList.length;

        for (let i = this.#sortedList.length - 1; i >= 0; i--){
            if (this.#sortedList[i]![0] <= order) {
                break;
            }

            insertIndex = 1;
        }

        this.#sortedList.splice(insertIndex, 0, [order, cb.bind(this.#target)]);
    }

    dispose() {
        window.removeEventListener(this.#name as any, this.#ecb as any);
    }

    private eventCallback(e: U): void {
        this.#sortedList.forEach(([_, cb]) => cb(e));
    }
}