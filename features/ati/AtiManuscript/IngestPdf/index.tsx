import { FC, useState } from "react"

import { InlineNotification } from "carbon-components-react"

import { Document, Page, pdfjs } from "react-pdf"
import { SizeMe } from "react-sizeme"

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export interface IngestPdfProps {
  /** The base64 string of the pdf */
  pdf: string
}

const IngestPdf: FC<IngestPdfProps> = ({ pdf }) => {
  const [numPages, setNumPages] = useState<number>(0)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  return (
    <SizeMe>
      {({ size }) => (
        <Document
          file={`data:application/pdf;base64,${pdf}`}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <InlineNotification
              hideCloseButton
              lowContrast
              kind="info"
              subtitle={<span>Loading manuscript...</span>}
              title="Status"
            />
          }
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={size.width as number}
              renderMode="canvas"
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      )}
    </SizeMe>
  )
}

export default IngestPdf
