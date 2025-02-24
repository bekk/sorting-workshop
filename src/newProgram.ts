import P5 from "p5";
import { AudioManager } from "./AudioManager";
import { frequencyMapper as getFrequencyMapper } from "./frequencyMapper";
import { PubSub } from "./sortingPubSub";
import { checkSorted, VisualArray } from "./VisualArray";
import { rangeAndInput } from "./components/rangeAndInput";
import { bubbleSort } from "./bubbleSort";

export function run(p5: P5) {
  let array: number[];
  const swapped = new Set<number>();
  const gotten = new Set<number>();
  const pubsub = new PubSub();
  let audioManager: AudioManager;

  function run() {
    const visualArray = new VisualArray(pubsub, array);
    bubbleSort(visualArray).then(() => checkSorted(visualArray));
  }

  p5.setup = () => {
    p5.createCanvas(800, 500);

    audioManager = new AudioManager();
    setupSoundSwitch(pubsub);
    rangeAndInput(document.getElementById("amountInput")!, {
      min: 0,
      max: 1000,
      step: 1,
      startingValue: 600,
      onChange: (value) => {
        pubsub.publish("cancelSort");
        array = Array(value)
          .fill(null)
          .map((_, i) => value - i);
      },
    });
    array = shuffled(600);
    const frequencyMapper = getFrequencyMapper({
      minValue: Math.min(...array),
      maxValue: Math.max(...array),
      minFrequency: 400,
      maxFrequency: 2000,
    });

    document.getElementById("runButton")!.addEventListener("click", () => {
      pubsub.publish("startSort");
    });
    document.getElementById("stopButton")!.addEventListener("click", () => {
      pubsub.publish("cancelSort");
    });

    document.getElementById("reverseButton")!.addEventListener("click", () => {
      pubsub.publish("cancelSort");
      array = reversed(array.length);
    });
    document.getElementById("randomButton")!.addEventListener("click", () => {
      pubsub.publish("cancelSort");
      array = shuffled(array.length);
    });

    pubsub.subscribe("startSort", () => run());

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
  };

  p5.draw = () => {
    p5.background(0);
    const width = p5.width / array.length;
    array.forEach((value, i) => {
      p5.noStroke();
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

function reversed(n: number) {
  return Array(n)
    .fill(null)
    .map((_, i) => n - i);
}

function shuffled(n: number) {
  return Array(n)
    .fill(null)
    .map((_, i) => i)
    .sort(() => Math.random() - 0.5);
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
