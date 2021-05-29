/**
 * Keeps a sorted array... as long as you don't modify things directly.
 */
export default class SortedArray<T> extends Array<T> {
    #comparator: (a: T, b:T) => number;

    constructor(comparator: (a: T, b: T) => number) {
      super();
      this.#comparator = comparator;
    }

    add(...items: T[]): number {
      items.forEach((val) => {
        const insertIndex = this.findIndex(((t) => this.#comparator(t, val) < 0));

        if (insertIndex < 1) {
          this.push(val);
          return;
        }

        this.splice(insertIndex, 0, val);
      });

      return this.length;
    }

    push(...items: T[]): number {
      return this.add(...items);
    }

    unshift(...items: T[]): number {
      return this.add(...items);
    }

    sort(): this {
      return super.sort(this.#comparator);
    }
}
