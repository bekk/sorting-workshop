import { PubSubBase } from "./pubsub/event";

export type Events = {
  get: { index: number };
  set: { index: number; value: number };
  compare: { i: number; j: number };
  swap: { i: number; j: number };
  highlightOnce: { index: number; color: string };
  setHighlight: { index: number; color: string };
  clearHighlight: { index: number };
  mute: undefined;
  unmute: undefined;
  cancelSort: undefined;
  startSort: undefined;
};

export class PubSub extends PubSubBase<Events> {}
