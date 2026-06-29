import type { VoteItemType } from "../domain/types";

export interface ItemCatalogEntry {
  type: VoteItemType;
  label: string;
}

export const itemCatalog: ItemCatalogEntry[] = [
  { type: "double", label: "โหวต 2 เสียง" },
  { type: "remove", label: "ลบ 1 เสียง" },
  { type: "swap", label: "สลับผลโหวต" },
  { type: "reduceThreshold", label: "R ลดเกณฑ์ 25%" },
  { type: "protectThreshold", label: "P ป้องกันการลดเกณฑ์" },
];
