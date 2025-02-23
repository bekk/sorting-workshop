import { PubSub } from "./sortingPubSub";

export class VisualArray {
  private pubsub: PubSub;
  private array: number[];
  length: number;

  constructor(pubsub: PubSub, array: number[]) {
    this.pubsub = pubsub;
    this.array = array;
    this.length = array.length;
  }

  async get(i: number): Promise<number> {
    await this.pubsub.publish({ type: "get", payload: { index: i } });
    return this.array[i];
  }

  async set(i: number, value: number): Promise<void> {
    await this.pubsub.publish({ type: "set", payload: { index: i, value } });
    await this.wait();
    this.array[i] = value;
  }

  async compare(i: number, j: number): Promise<number> {
    await this.pubsub.publish({ type: "compare", payload: { i, j } });
    return this.array[i] - this.array[j];
  }

  async swap(i: number, j: number): Promise<void> {
    await this.pubsub.publish({ type: "swap", payload: { i, j } });
    await this.wait();
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
  }

  async wait() {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export async function bubbleSort(array: VisualArray) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if ((await array.compare(j, j + 1)) > 0) {
        await array.swap(j, j + 1);
      }
    }
  }
}
