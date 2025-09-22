import { VisualArray } from ".";
import { PubSub } from "../sortingPubSub";

export class VisualArrayImplementation implements VisualArray {
  private pubsub: PubSub;
  private array: number[];
  length: number;
  private isCancelled = false;

  constructor(pubsub: PubSub, array: number[]) {
    this.pubsub = pubsub;
    this.array = array;
    this.length = array.length;

    pubsub.subscribe("cancelSort", () => {
      this.isCancelled = true;
    });
  }

  private assertIndex(i: number, name?: string) {
    if (i < 0 || i >= this.length) {
      throw new Error(`Index ${name ?? "i"} out of bounds ${i}`);
    }
  }

  private checkCancelled() {
    if (this.isCancelled) {
      this.isCancelled = false;
      throw new Error("Operation cancelled");
    }
  }

  async get(i: number): Promise<number> {
    this.assertIndex(i);
    this.pubsub.publish("get", { index: i });
    this.highlightOnce(i, "green");
    await this.wait(0);
    return this.array[i];
  }

  async set(i: number, value: number): Promise<void> {
    this.assertIndex(i);
    this.pubsub.publish("set", { index: i, value });
    await this.wait(0);
    this.array[i] = value;
  }

  async compare(i: number, j: number): Promise<number> {
    this.assertIndex(i, "i");
    this.assertIndex(j, "j");
    this.highlightOnce(i);
    this.highlightOnce(j);
    this.pubsub.publish("compare", { i, j });
    await this.wait(0);
    return this.array[i] - this.array[j];
  }

  async swap(i: number, j: number): Promise<void> {
    this.assertIndex(i, "i");
    this.assertIndex(j, "j");
    this.pubsub.publish("swap", { i, j });
    this.highlightOnce(i);
    this.highlightOnce(j);
    await this.wait(0);
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
  }

  private async wait(time: number = 1) {
    this.checkCancelled();
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  highlightOnce(index: number, color?: string) {
    this.pubsub.publish("highlightOnce", { index, color: color ?? "red" });
  }

  setHighlight(index: number, color?: string) {
    this.pubsub.publish("setHighlight", { index, color: color ?? "green" });
  }

  clearHighlight(index: number) {
    this.pubsub.publish("clearHighlight", { index });
  }
  clearHighlights() {
    this.pubsub.publish("clearHighlights");
  }
}

export async function checkSorted(array: VisualArray) {
  let prev = -Infinity;
  for (let i = 0; i < array.length - 1; i++) {
    let current = await array.get(i);
    if (current >= prev) {
      array.setHighlight(i, "green");
    } else {
      array.setHighlight(i - 1, "red");
      array.setHighlight(i, "red");
    }
    prev = current;
  }
}
