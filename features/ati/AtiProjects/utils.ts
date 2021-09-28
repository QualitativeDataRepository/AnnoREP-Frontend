export const getLabelTextForPublicationStatus = (
  status: string,
  counts: Record<string, number>
): string => {
  const key = `${status.toLowerCase().split(" ").join("_")}_count`
  const count = counts[key]
  return `${status} (${count})`
}

export const getTrueFields = (fields: Record<string, boolean>): string[] => {
  return Object.keys(fields).filter((field) => fields[field])
}
