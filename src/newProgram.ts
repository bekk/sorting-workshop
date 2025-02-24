import P5 from "p5";
import { AudioManager } from "./AudioManager";
import { frequencyMapper as getFrequencyMapper } from "./frequencyMapper";
import { PubSub } from "./sortingPubSub";
import { checkSorted, VisualArray } from "./VisualArray";
import { bubbleSort } from "./bubbleSort";

export function run(p5: P5) {
  let array: number[];
  const swapped = new Set<number>();
  const gotten = new Set<number>();
  let audioManager: AudioManager;

  p5.setup = () => {
    p5.createCanvas(800, 500);

    const pubsub = new PubSub();
    audioManager = new AudioManager();
    setupSoundSwitch(pubsub);
    array = Array(600)
      .fill(null)
      .map((_, i) => 600 - i);
    const frequencyMapper = getFrequencyMapper({
      minValue: Math.min(...array),
      maxValue: Math.max(...array),
      minFrequency: 400,
      maxFrequency: 2000,
    });
    const visualArray = new VisualArray(pubsub, array);

    pubsub.subscribe("set", ({ index }) => {
      const frequency = frequencyMapper(array[index]);
      swapped.add(index);
      audioManager.play({ frequency, durationMs: 10 });
    });

    pubsub.subscribe("get", ({ index }) => {
      const frequency = frequencyMapper(array[index]);
      gotten.add(index);
      audioManager.play({ frequency, durationMs: 10 });
    });

    pubsub.subscribe("swap", ({ i, j }) => {
      swapped.add(i);
      swapped.add(j);
      audioManager.play({
        frequency: frequencyMapper(array[i]),
        durationMs: 10,
      });
      audioManager.play({
        frequency: frequencyMapper(array[j]),
        durationMs: 10,
      });
    });

    pubsub.subscribe("mute", () => audioManager.enable());
    pubsub.subscribe("unmute", () => audioManager.disable());

    bubbleSort(visualArray).then(() => checkSorted(visualArray));
  };

  p5.draw = () => {
    p5.background(0);
    const width = p5.width / array.length;
    array.forEach((value, i) => {
      p5.fill(255);
      if (swapped.has(i)) {
        p5.fill(255, 0, 0);
        swapped.delete(i);
      } else if (gotten.has(i)) {
        p5.fill(0, 255, 0);
        gotten.delete(i);
      }
      p5.rect(
        i * width,
        p5.height,
        width,
        p5.map(value, 0, array.length, 0, -p5.height)
      );
    });
  };
}

function setupSoundSwitch(pubsub: PubSub) {
  const soundSwitch = document.getElementById(
    "soundSwitch"
  ) as HTMLInputElement;
  soundSwitch.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      pubsub.publish("mute");
    } else {
      pubsub.publish("unmute");
    }
  });
}
