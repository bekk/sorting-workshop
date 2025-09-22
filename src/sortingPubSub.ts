import { ArrayInitMethod } from "./arrayInitialize";
import { ImageSortType } from "./imageType";
import { PubSubBase } from "./pubsub";
import { SortFunctionName } from "./sortFunctions";

export type Events = {
  get: { index: number };
  set: { index: number; value: number };
  compare: { i: number; j: number };
  swap: { i: number; j: number };
  highlightOnce: { index: number; color: string };
  setHighlight: { index: number; color: string };
  clearHighlight: { index: number };
  clearHighlights: undefined;
  setSortAlgorithm: { algorithm: SortFunctionName };
  setArrayInitMethod: { method: ArrayInitMethod };
  setImageSortType: { method: ImageSortType };
  mute: undefined;
  unmute: undefined;
  cancelSort: undefined;
  startSort: undefined;
};

export class PubSub extends PubSubBase<Events> {}
