/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range
 * @param start start > 0
 * @param stop stop >= start
 * @param step step > 0
 * @returns An array of numbers from start to stop, inclusive and incremented by step.
 */
export const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
