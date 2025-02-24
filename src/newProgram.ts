import P5 from "p5";
import { AudioManager } from "./AudioManager";
import { frequencyMapper as getFrequencyMapper } from "./frequencyMapper";
import { PubSub } from "./sortingPubSub";
import { checkSorted, VisualArray } from "./VisualArray";
import { rangeAndInput } from "./components/rangeAndInput";
import { bubbleSort } from "./bubbleSort";

export function run(p5: P5) {
  let array: number[];
  const tempHighlights: Map<number, P5.Color> = new Map();
  const highlights: Map<number, P5.Color> = new Map();
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
      pubsub.publish("cancelSort");
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

    pubsub.subscribe("highlightOnce", ({ index, color }) => {
      tempHighlights.set(index, p5.color(color));
    });

    pubsub.subscribe("setHighlight", ({ index, color }) => {
      highlights.set(index, p5.color(color));
    });

    pubsub.subscribe("clearHighlight", ({ index }) => {
      highlights.delete(index);
    });

    pubsub.subscribe("set", ({ index }) => {
      const frequency = frequencyMapper(array[index]);
      audioManager.play({ frequency, durationMs: 10 });
    });

    pubsub.subscribe("get", ({ index }) => {
      const frequency = frequencyMapper(array[index]);
      audioManager.play({ frequency, durationMs: 10 });
    });

    pubsub.subscribe("swap", ({ i, j }) => {
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
      p5.fill(tempHighlights.get(i) ?? highlights.get(i) ?? p5.color(255));
      p5.rect(
        i * width,
        p5.height,
        width,
        p5.map(value, 0, array.length, 0, -p5.height)
      );
    });
    tempHighlights.clear();
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
