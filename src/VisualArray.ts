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

  private assertIndex(i: number, name?: string) {
    if (i < 0 || i >= this.length) {
      throw new Error(`Index ${name ?? "i"} out of bounds ${i}`);
    }
  }

  async get(i: number): Promise<number> {
    this.assertIndex(i);
    await this.pubsub.publish({ type: "get", payload: { index: i } });
    await this.wait();
    return this.array[i];
  }

  async set(i: number, value: number): Promise<void> {
    this.assertIndex(i);
    await this.pubsub.publish({ type: "set", payload: { index: i, value } });
    await this.wait();
    this.array[i] = value;
  }

  async compare(i: number, j: number): Promise<number> {
    this.assertIndex(i, "i");
    this.assertIndex(j, "j");
    await this.pubsub.publish({ type: "compare", payload: { i, j } });
    return this.array[i] - this.array[j];
  }

  async swap(i: number, j: number): Promise<void> {
    this.assertIndex(i, "i");
    this.assertIndex(j, "j");
    await this.pubsub.publish({ type: "swap", payload: { i, j } });
    await this.wait();
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
  }

  async wait() {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export async function checkSorted(array: VisualArray) {
  for (let i = 0; i < array.length - 1; i++) {
    await array.get(i);
  }
}
