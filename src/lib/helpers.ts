import { Prisma } from "@prisma/client";

export function toSortOrder(value?: string): Prisma.SortOrder {
  return value === "desc" ? "desc" : "asc";
}

export function toInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}
