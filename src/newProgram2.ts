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

const frag = `#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec2 vTexCoord;
uniform sampler2D src;        // original image
uniform sampler2D permTex;    // 1xN permutation texture
uniform vec2 iResolution;     // [img.width, img.height]
uniform vec2 blockSize;       // e.g. [10.0, 10.0]

vec2 sizeInBlocks() {
    return ceil(iResolution / blockSize);
}

int blockToIndex(vec2 block) {
    vec2 sb = sizeInBlocks();
    return int(sb.x * block.y + block.x);
}

vec2 indexToBlock(int index) {
    vec2 sb = sizeInBlocks();
    float f = float(index);
    return vec2(mod(f, sb.x), floor(f / sb.x));
}

// Decode target index from two 8-bit channels stored in permTex.
// px.r = low byte, px.g = high byte (both 0..1)
/* int fetchMappedIndex(int index) {
    float u = (float(index) + 0.5) / permTexWidth;   // sample center of texel
    vec4 px = texture2D(permTex, vec2(u, 0.5));
    float lo = floor(px.r * 255.0 + 0.5);
    float hi = floor(px.g * 255.0 + 0.5);
    return int(hi * 256.0 + lo);                   // == (hi << 8) + lo, but float
} */

int fetchMappedIndex(vec2 block) {
    vec2 u = (block + 0.5) / sizeInBlocks();   // sample center of texel
    vec4 px = texture2D(permTex, u);
    float lo = floor(px.r * 255.0 + 0.5);
    float hi = floor(px.g * 255.0 + 0.5);
    return int(hi * 256.0 + lo);                   // == (hi << 8) + lo, but float
}

void main() {
    vec2 fragCoord   = vTexCoord * iResolution;

    vec2 thisBlock   = floor(fragCoord / blockSize);
    int  thisIndex   = blockToIndex(thisBlock);
    int  targetIndex = fetchMappedIndex(thisBlock);

    vec2 targetBlock = indexToBlock(targetIndex);
    vec2 fractional  = mod(fragCoord, blockSize);
    vec2 targetPixel = (targetBlock * blockSize) + fractional;

    gl_FragColor = texture2D(src, targetPixel / iResolution);
    //gl_FragColor = vec4(fragCoord / iResolution, 1.0, 1.0);
}
`;

const vert = `attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0; // map [0,1] -> [-1,1]
  positionVec4.y *= -1.0; // flip y for WebGL coords
  gl_Position = positionVec4;
}`;

export function run(p5: P5) {
  let array: number[];
  const bx = 5;
  const by = 5;
  let rows = 0;
  let cols = 0;
  let NBlocks = 0;
  const theShader = p5.createShader(vert, frag);
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

  let permImg: P5.Image;
  const image = p5.loadImage("src/shrek.png", (img) => {
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
    p5.noSmooth(); // IMPORTANT: forces NEAREST filtering for textures in p5

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
    pubsub.subscribe("compare", ({ i, j }) => {
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
