import P5 from "p5";
import { VisualList } from "./VisualList";

export function program(p5: P5) {
  let visualList: VisualList;
  let sortingDone = false;

  p5.setup = () => {
    p5.createCanvas(800, 500);
    let values = Array.from({ length: 100 }, () =>
      p5.floor(p5.random(10, 100))
    );
    visualList = new VisualList(p5, values);
    visualList.bubbleSort().then(() => visualList.afterSort()); // Run sorting in the background
  };

  p5.draw = () => {
    p5.background(0);
    visualList.draw();
    if (sortingDone) p5.noLoop(); // Stop animation when sorting is done
  };
}
