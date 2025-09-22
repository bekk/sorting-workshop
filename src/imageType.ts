export const imageSortTypes = ["rows", "columns", "pixels"] as const;

export type ImageSortType = (typeof imageSortTypes)[number];

export const imageSortTypeDescriptions: Record<ImageSortType, string> = {
  rows: "Rader",
  columns: "Kolonner",
  pixels: "Pixler",
};

export function isImageSortType(type: string): type is ImageSortType {
  return imageSortTypes.includes(type as ImageSortType);
}
