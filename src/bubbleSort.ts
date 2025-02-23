import { VisualArray } from "./VisualArray";

export async function bubbleSort(array: VisualArray) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if ((await array.compare(j, j + 1)) > 0) {
        await array.swap(j, j + 1);
      }
    }
  }
}
