export interface VisualArray {
  length: number;
  get(i: number): Promise<number>;
  set(i: number, value: number): Promise<void>;
  /**
   * Compares the values at indices i and j.
   *
   * Returns a number with the same sign as `array[i] - array[j]`:
   * * a negative number < 0 if `array[i] < array[j]`,
   * * a positive number > 0 if `array[i] > array[j]`,
   * * 0 if `array[i] == array[j]`
   * @param i index
   * @param j index
   */
  compare(i: number, j: number): Promise<number>;
  swap(i: number, j: number): Promise<void>;
  /**
   * Marks the element at index `index` with a color for a single frame of rendering
   * @param index
   * @param color
   */
  highlightOnce(index: number, color?: string): void;
  /**
   * Marks the element at index `index` with a color
   * @param index
   * @param color
   */
  setHighlight(index: number, color?: string): void;
  /**
   * Removes the highlight from the element at index `index`
   * @param index
   */
  clearHighlight(index: number): void;
  /**
   * Removes the highlight from all elements
   * @param index
   */
  clearHighlights(): void;
}
