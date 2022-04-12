export const AtiTab = {
  summary: { id: "summary", label: "Summary" },
  manuscript: { id: "manuscript", label: "Manuscript" },
  exportAnnotations: { id: "exportAnnotations", label: "Export annotations" },
  settings: { id: "settings", label: "Settings" },
} as const

export type IAtiTab = keyof typeof AtiTab

export const tabs = [
  AtiTab.summary.id,
  AtiTab.manuscript.id,
  AtiTab.exportAnnotations.id,
  AtiTab.settings.id,
]

export const ATI_HEADER_HTML =
  '<a href="https://qdr.syr.edu/ati"><img src="https://qdr.syr.edu/drupal_data/public/ati_banner_long.png" align="left"/></a><br>'
