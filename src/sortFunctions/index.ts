import { VisualArray } from "../VisualArray";
import { sortFunctions } from "./_registerSortFunctions";

export type SortFunction = (array: VisualArray) => Promise<void>;
export type SortFunctionName = keyof typeof sortFunctions;
export { sortFunctions } from "./_registerSortFunctions";
export function isSortFunctionName(name: string): name is SortFunctionName {
  return name in sortFunctions;
}
