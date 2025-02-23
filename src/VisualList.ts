import P5 from "p5";
import { AudioManager } from "./AudioManager";

export class VisualList {
  arr: number[];
  p5: P5;
  waitTimeInMs: number = 10;
  audioManager: AudioManager;

  constructor(p5: P5, arr: number[]) {
    this.arr = arr;
    this.p5 = p5;
    this.audioManager = new AudioManager();

    //this.operations = []; // Stores step-by-step actions
  }

  async bubbleSort() {
    for (let i = 0; i < this.arr.length; i++) {
      for (let j = 0; j < this.arr.length - i - 1; j++) {
        if (this.arr[j] > this.arr[j + 1]) {
          await this.swap(j, j + 1);
        }
      }
    }
  }

  async afterSort() {
    for (let i = 0; i < this.arr.length; i++) {
      this.play(i);
      await this.wait();
    }
  }

  async swap(i: number, j: number) {
    [this.arr[i], this.arr[j]] = [this.arr[j], this.arr[i]];
    this.play(i);
    this.play(j);
    await this.wait();
  }

  play(index: number) {
    const minFreq = 400;
    const maxFreq = 2000;
    const maxVal = Math.max(...this.arr);
    const minVal = Math.min(...this.arr);
    const frequency =
      ((this.arr[index] - minVal) / (maxVal - minVal)) * (maxFreq - minFreq) +
      minFreq;
    this.audioManager.play({ frequency, durationMs: 10 });
  }

  async wait() {
    await new Promise((resolve) => setTimeout(resolve, this.waitTimeInMs)); // Delay for animation
  }

  draw() {
    this.p5.background(0);
    const width = this.p5.width / this.arr.length;
    for (let i = 0; i < this.arr.length; i++) {
      this.p5.fill(255);
      this.p5.rect(
        i * width,
        this.p5.height - this.arr[i] * 3,
        width - 1,
        this.arr[i] * 3
      );
    }
  }
}
