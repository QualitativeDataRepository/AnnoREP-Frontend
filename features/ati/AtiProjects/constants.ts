export const SORT_SEPARATOR = "-"

export const SORT_ITEMS = [
  `name${SORT_SEPARATOR}asc`,
  `name${SORT_SEPARATOR}desc`,
  `date${SORT_SEPARATOR}desc`,
  `date${SORT_SEPARATOR}asc`,
]

export const SORT_LABEL = {
  [SORT_ITEMS[0]]: "Name (A-Z)",
  [SORT_ITEMS[1]]: "Name (Z-A)",
  [SORT_ITEMS[2]]: "Newest",
  [SORT_ITEMS[3]]: "Oldest",
} as Record<string, string>
