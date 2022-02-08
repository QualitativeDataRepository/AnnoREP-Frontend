import { ManuscriptMimeType, MimeTypeHex } from "../constants/arcore"

export const getMimeType = async (file: File): Promise<string> => {
  if (file.type) {
    return file.type
  }
  const firstFourBytes = await file.slice(0, 4).arrayBuffer()
  const firstFourBytesView = new Int8Array(firstFourBytes)
  const hex = getHex(firstFourBytesView)
  if (hex === MimeTypeHex.docx) {
    return ManuscriptMimeType.docx
  } else if (hex === MimeTypeHex.pdf) {
    return ManuscriptMimeType.pdf
  } else {
    return "unknown"
  }
}

const getHex = (view: Int8Array): string => {
  const hex: string[] = []
  for (let i = 0; i < view.length; i++) {
    hex.push(view[i].toString(16))
  }
  return hex.join("")
}
