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
import { setupImageTypeRadioButtons } from "./components/imageTypeRadio";
import { ImageSortType } from "./imageType";

// en shrek kar
// const imagePath = "src/image/shrek.png";
// mange kjekke folk
const algpip = [
  208, // Joakim
  1179, // Fredrik
  1219, // Håvard
  1545, // Sondre
  1568, // Torjus
  1635, // Bernt
  1645, // Thomas
  1764, // Silje
  1848, // Even
  1885, // Martin
];
const imagePath = `https://res.cloudinary.com/bekkimg/w_768,h_1024,c_fill,f_auto/d_default_image_departmentId2.png/${
  algpip[Math.floor(Math.random() * algpip.length)]
}`;

const rowSize = 1;
const colSize = 1;
const pixelBlockSize = 15;

export function run(p5: P5) {
  let imageSortType: ImageSortType = "pixels";
  let array: number[];
  let bx = rowSize;
  let by = colSize;
  let rows = 0;
  let cols = 0;
  let NBlocks = 0;
  const theShader = p5.loadShader("src/image/vert.vert", "src/image/frag.frag");
  let sortAlgorithm = bubbleSort;
  const tempHighlights: Map<number, P5.Color> = new Map();
  const highlights: Map<number, P5.Color> = new Map();
  const pubsub = new PubSub();
  let arrayInitMethod: ArrayInitMethod = "shuffled";

  const MAX_CANVAS = { w: 1280, h: 720 };

  function fitCanvasToImage(img: P5.Image) {
    const factor = Math.min(
      MAX_CANVAS.w / img.width,
      MAX_CANVAS.h / img.height
    );
    p5.resizeCanvas(img.width * factor, img.height * factor);
  }

  function updateBlockGeometry(method: ImageSortType, img: P5.Image) {
    if (method === "rows") {
      bx = img.width;
      by = rowSize;
    } else if (method === "columns") {
      bx = colSize;
      by = img.height;
    } else {
      bx = pixelBlockSize;
      by = pixelBlockSize;
    }
    cols = Math.ceil(img.width / bx);
    rows = Math.ceil(img.height / by);
    NBlocks = cols * rows;
    array = initializeArray(NBlocks, arrayInitMethod);
    makePermutationTexture(array);
  }

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
  const image = p5.loadImage(imagePath, (img) => {
    fitCanvasToImage(img);
    updateBlockGeometry(imageSortType, img);
  });

  p5.setup = () => {
    p5.createCanvas(MAX_CANVAS.w, MAX_CANVAS.h, p5.WEBGL);
    p5.frameRate(120);
    p5.noSmooth(); // IMPORTANT: forces NEAREST filtering for textures in p5
    setupAlgoSelect(pubsub);
    setupInitTypeRadioButtons(pubsub);
    setupImageTypeRadioButtons(pubsub);
    array = initializeArray(500, arrayInitMethod);

    document.getElementById("runButton")!.addEventListener("click", () => {
      reset();
      pubsub.publish("startSort");
    });
    document.getElementById("stopButton")!.addEventListener("click", () => {
      reset();
    });

    pubsub.subscribe("setImageSortType", ({ method }) => {
      imageSortType = method;
      if (image && image.width > 0) {
        updateBlockGeometry(imageSortType, image);
      }
      reset();
    });
    pubsub.subscribe("startSort", () => run());
    pubsub.subscribe("setArrayInitMethod", ({ method }) => {
      arrayInitMethod = method;
      reset();
      array = initializeArray(NBlocks, arrayInitMethod);
      updatePermutationTexture(array);
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
    permImg = p5.createImage(cols, rows);
    updatePermutationTexture(permArray);
  }

  function updatePermutationTexture(permArray: number[]) {
    permImg.loadPixels();
    for (let i = 0; i < rows * cols; i++) {
      const v = permArray[i]; // target index
      const lo = v & 0xff; // low byte
      const hi = (v >> 8) & 0xff; // high byte
      const p = i * 4;
      const highlight = tempHighlights.get(i);
      permImg.pixels[p + 0] = lo; // R
      permImg.pixels[p + 1] = hi; // G
      permImg.pixels[p + 2] = highlight === undefined ? 0 : 255; // B
      permImg.pixels[p + 3] = 255; // A
    }
    permImg.updatePixels();
  }

  p5.draw = () => {
    if (!permImg || !image || image.width === 0 || image.height === 0) {
      return;
    }
    if (array.length !== NBlocks) {
      array = initializeArray(NBlocks, arrayInitMethod);
      makePermutationTexture(array);
    }
    updatePermutationTexture(array);
    tempHighlights.clear();

    // bryr oss lite om farge (gray), men vil wipe til 0 alpha (transparent)
    p5.background(0, 0);
    p5.shader(theShader);
    theShader.setUniform("src", image);
    theShader.setUniform("permTex", permImg);
    theShader.setUniform("iResolution", [image.width, image.height]);
    theShader.setUniform("blockSize", [bx, by]);

    // draw a full-screen quad
    p5.rectMode(p5.CENTER);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);
  };
}
