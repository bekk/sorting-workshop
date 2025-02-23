import { EventBase, PubSubBase as PubSubBase } from "./pubsub/event";

export type Event =
  | EventBase<"get", { index: number }>
  | EventBase<"set", { index: number; value: number }>
  | EventBase<"compare", { i: number; j: number }>
  | EventBase<"swap", { i: number; j: number }>;
export class PubSub extends PubSubBase<Event> {}
