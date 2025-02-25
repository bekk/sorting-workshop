export const arrayInitMethods = ["shuffled", "reversed"] as const;

export type ArrayInitMethod = (typeof arrayInitMethods)[number];

export const arrayInitMethodDescriptions: Record<ArrayInitMethod, string> = {
  shuffled: "Tilfeldig",
  reversed: "Revers",
};

export function isArrayInitMethod(method: string): method is ArrayInitMethod {
  return arrayInitMethods.includes(method as ArrayInitMethod);
}

export function initializeArray(
  length: number,
  type: ArrayInitMethod
): number[] {
  switch (type) {
    case "shuffled":
      return shuffledArray(length);
    case "reversed":
      return reversedArray(length);
  }
}

function shuffledArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i).sort(() => Math.random() - 0.5);
}

function reversedArray(length: number): number[] {
  return Array.from({ length }, (_, i) => length - i);
}
