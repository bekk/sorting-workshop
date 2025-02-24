import { PubSubBase } from "./pubsub/event";

export type Events = {
  get: { index: number };
  set: { index: number; value: number };
  compare: { i: number; j: number };
  swap: { i: number; j: number };
  mute: undefined;
  unmute: undefined;
};

export class PubSub extends PubSubBase<Events> {}
