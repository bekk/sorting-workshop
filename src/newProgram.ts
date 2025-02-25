import P5 from "p5";
import { AudioManager } from "./AudioManager";
import { frequencyMapper as getFrequencyMapper } from "./frequencyMapper";
import { PubSub } from "./sortingPubSub";
import { rangeAndInput } from "./components/rangeAndInput";
import { sortFunctions } from "./sortFunctions/_registerSortFunctions";
import { bubbleSort } from "./sortFunctions/bubbleSort";
import {
  checkSorted,
  VisualArrayImplementation,
} from "./visualArray/visualArrayImplementation";
import { setupMuteButton } from "./components/muteButton";
import { setupAlgoSelect } from "./components/algorithmSelect";
import { setupInitTypeRadioButtons } from "./components/initTypeRadio";
import { ArrayInitMethod, initializeArray } from "./arrayInitialize";

export function run(p5: P5) {
  let array: number[];
  let sortAlgorithm = bubbleSort;
  const tempHighlights: Map<number, P5.Color> = new Map();
  const highlights: Map<number, P5.Color> = new Map();
  const pubsub = new PubSub();
  let audioManager: AudioManager;
  let arrayInitMethod: ArrayInitMethod = "shuffled";

  function run() {
    const visualArray = new VisualArrayImplementation(pubsub, array);
    sortAlgorithm(visualArray).then(() => checkSorted(visualArray));
  }

  function reset() {
    tempHighlights.clear();
    highlights.clear();
    pubsub.publish("cancelSort");
  }

  p5.setup = () => {
    p5.createCanvas(1000, 720);

    audioManager = new AudioManager();
    setupMuteButton(pubsub);
    rangeAndInput(document.getElementById("amountInput")!, {
      min: 0,
      max: 1000,
      step: 1,
      startingValue: 500,
      onChange: (value) => {
        pubsub.publish("cancelSort");
        array = initializeArray(value, arrayInitMethod);
      },
    });
    setupAlgoSelect(pubsub);
    setupInitTypeRadioButtons(pubsub);
    array = initializeArray(500, arrayInitMethod);
    const frequencyMapper = getFrequencyMapper({
      minValue: Math.min(...array),
      maxValue: Math.max(...array),
      minFrequency: 400,
      maxFrequency: 2000,
    });

    document.getElementById("runButton")!.addEventListener("click", () => {
      reset();
      pubsub.publish("startSort");
    });
    document.getElementById("stopButton")!.addEventListener("click", () => {
      reset();
    });

    pubsub.subscribe("startSort", () => run());
    pubsub.subscribe("setArrayInitMethod", ({ method }) => {
      arrayInitMethod = method;
      array = initializeArray(array.length, method);
    });

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

    pubsub.subscribe("setSortAlgorithm", ({ algorithm }) => {
      console.log("setSortAlgorithm", algorithm);
      sortAlgorithm = sortFunctions[algorithm];
      reset();
    });
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
