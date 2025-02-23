import P5 from "p5";
import { AudioManager } from "./AudioManager";
import { frequencyMapper as getFrequencyMapper } from "./frequencyMapper";
import { PubSub } from "./sortingPubSub";
import { bubbleSort, VisualArray } from "./VisualArray";

export function run(p5: P5) {
  let array: number[];
  p5.setup = () => {
    p5.createCanvas(800, 500);

    const pubsub = new PubSub();
    const audioManager = new AudioManager();
    array = Array(50)
      .fill(null)
      .map((_, i) => 50 - i);
    const frequencyMapper = getFrequencyMapper({
      minValue: Math.min(...array),
      maxValue: Math.max(...array),
      minFrequency: 400,
      maxFrequency: 2000,
    });
    const visualArray = new VisualArray(pubsub, array);

    pubsub.subscribe("set", async ({ payload }) => {
      const { index } = payload;
      const frequency = frequencyMapper(array[index]);
      audioManager.play({ frequency, durationMs: 10 });
    });

    pubsub.subscribe("swap", async ({ payload }) => {
      const { i, j } = payload;
      audioManager.play({
        frequency: frequencyMapper(array[i]),
        durationMs: 10,
      });
      audioManager.play({
        frequency: frequencyMapper(array[j]),
        durationMs: 10,
      });
    });

    bubbleSort(visualArray);
  };

  p5.draw = () => {
    p5.background(0);
    const width = p5.width / array.length;
    p5.fill(255);
    array.forEach((value, i) => {
      p5.rect(i * width, p5.height, width, -value * 5);
    });
  };
}
