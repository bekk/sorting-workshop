import P5 from "p5";
import { PubSub } from "./sortingPubSub";
import { sortFunctions } from "./sortFunctions/_registerSortFunctions";
import { bubbleSort } from "./sortFunctions/bubbleSort";
import {
  checkSorted,
  VisualArrayImplementation,
} from "./visualArray/visualArrayImplementation";
import { setupAlgoSelect } from "./components/algorithmSelect";
import { setupInitTypeRadioButtons } from "./components/initTypeRadio";
import { ArrayInitMethod, initializeArray } from "./arrayInitialize";

export function run(p5: P5) {
  let array: number[];
  let bx = 5;
  let by = 5;
  let rows = 0;
  let cols = 0;
  let NBlocks = 0;
  const theShader = p5.loadShader("src/image/vert.vert", "src/image/frag.frag");
  let sortAlgorithm = bubbleSort;
  const tempHighlights: Map<number, P5.Color> = new Map();
  const highlights: Map<number, P5.Color> = new Map();
  const pubsub = new PubSub();
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

  let permImg: P5.Image;
  const image = p5.loadImage("src/image/shrek.png", (img) => {
    // fit canvas to image aspect ratio
    // as big as possible, without exceeding 1280x720
    const factor = Math.min(1280 / img.width, 720 / img.height);
    p5.resizeCanvas(img.width * factor, img.height * factor);

    cols = Math.ceil(img.width / bx);
    rows = Math.ceil(img.height / by);
    NBlocks = cols * rows;
    array = initializeArray(NBlocks, arrayInitMethod); // just to set NBlocks

    // build an initial permutation (identity)
    const perm = new Array(NBlocks);
    for (let i = 0; i < NBlocks; i++) perm[i] = i;

    // later, as your sorting algorithm runs, update perm to the current step
    permImg = makePermutationTexture(perm);
  });

  p5.setup = () => {
    p5.createCanvas(1280, 720, p5.WEBGL);
    p5.frameRate(120);
    p5.noSmooth(); // IMPORTANT: forces NEAREST filtering for textures in p5
    setupAlgoSelect(pubsub);
    setupInitTypeRadioButtons(pubsub);
    array = initializeArray(500, arrayInitMethod);

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
      reset();
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

    pubsub.subscribe("setSortAlgorithm", ({ algorithm }) => {
      sortAlgorithm = sortFunctions[algorithm];
      reset();
    });
  };

  function makePermutationTexture(permArray: number[]) {
    // permArray: JS array of ints in [0, NBlocks-1], length NBlocks
    const w = cols;
    const h = rows;
    const tex = p5.createImage(w, h);
    tex.loadPixels();
    for (let i = 0; i < w * h; i++) {
      const v = permArray[i]; // target index
      const lo = v & 0xff; // low byte
      const hi = (v >> 8) & 0xff; // high byte
      const p = i * 4;
      tex.pixels[p + 0] = lo; // R
      tex.pixels[p + 1] = hi; // G
      tex.pixels[p + 2] = 0; // B
      tex.pixels[p + 3] = 255; // A
    }
    tex.updatePixels();
    return tex;
  }

  p5.draw = () => {
    if (!permImg || !image || image.width === 0 || image.height === 0) {
      return;
    }
    if (array.length !== NBlocks) {
      array = initializeArray(NBlocks, arrayInitMethod);
      permImg = makePermutationTexture(array);
    }
    permImg = makePermutationTexture(array);

    p5.background(0, 0);
    p5.shader(theShader);
    //p5.image(image, 0, 0, p5.width, p5.height);
    theShader.setUniform("src", image);
    theShader.setUniform("permTex", permImg);
    theShader.setUniform("iResolution", [image.width, image.height]);
    theShader.setUniform("blockSize", [bx, by]); // same as above

    // draw a full-screen quad
    p5.rectMode(p5.CENTER);
    p5.noStroke();
    // Ensure the geometry fills the viewport; p5 feeds normalized uv to the frag
    p5.rect(0, 0, p5.width, p5.height);
  };
}
