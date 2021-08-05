import { ManuscriptMimeType, MimeTypeHex } from "../constants/arcore"

export const getMimeType = (view: Int8Array) => {
  const hex = getHex(view)
  if (hex === MimeTypeHex.docx) {
    return ManuscriptMimeType.docx
  } else if (hex === MimeTypeHex.pdf) {
    return ManuscriptMimeType.pdf
  } else {
    return "unknown"
  }
}

const getHex = (view: Int8Array) => {
  const hex: string[] = []
  for (let i = 0; i < view.length; i++) {
    hex.push(view[i].toString(16))
  }
  return hex.join("")
}
