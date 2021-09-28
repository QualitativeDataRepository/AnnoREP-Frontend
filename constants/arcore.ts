export enum ManuscriptMimeType {
  docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf = "application/pdf",
}

export enum ManuscriptFileExtension {
  docx = ".docx",
  pdf = ".pdf",
}

//The first four hex of these file types
export enum MimeTypeHex {
  docx = "504b34",
  pdf = "25504446",
}
