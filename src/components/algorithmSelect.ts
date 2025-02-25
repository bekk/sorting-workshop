import { isSortFunctionName, sortFunctions } from "../sortFunctions";
import { PubSub } from "../sortingPubSub";
import { select } from "./select";

export function setupAlgoSelect(pubsub: PubSub) {
  const element = document.getElementById("algoSelect")!;
  select(element, {
    options: Object.entries(sortFunctions).map(([name, _]) => ({
      value: name,
      text: name,
    })),
    onChange: (algorithm: string) => {
      if (!isSortFunctionName(algorithm)) {
        throw new Error(`Invalid algorithm: ${algorithm}`);
      }
      pubsub.publish("setSortAlgorithm", { algorithm });
    },
  });
}
