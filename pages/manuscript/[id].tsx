import { FC, useState } from "react"

import axios from "axios"
import { InlineNotification } from "carbon-components-react"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { getSession } from "next-auth/client"

import { Document, Page, pdfjs } from "react-pdf"
import { SizeMe } from "react-sizeme"

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

import { DATAVERSE_HEADER_NAME } from "../../constants/dataverse"
import { getResponseFromError } from "../../utils/httpRequestUtils"
import { REQUEST_DESC_HEADER_NAME } from "../../constants/http"

interface ManuscriptProps {
  isLoggedIn: boolean
  manuscript: string
  errorMsg: string
}

const Manuscript: FC<ManuscriptProps> = ({ isLoggedIn, manuscript, errorMsg }) => {
  const [numPages, setNumPages] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }
  let content
  if (manuscript) {
    content = (
      <SizeMe>
        {({ size }) => (
          <Document
            file={`data:application/pdf;base64,${manuscript}`}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={size.width as number}
                renderMode="canvas"
              />
            ))}
          </Document>
        )}
      </SizeMe>
    )
  } else if (errorMsg) {
    content = (
      <InlineNotification
        hideCloseButton
        kind="error"
        subtitle={<span>{errorMsg}</span>}
        title="Error!"
      />
    )
  } else {
    content = (
      <InlineNotification
        hideCloseButton
        kind="info"
        subtitle={
          <span>{isLoggedIn ? "You don't have access to this manuscript." : "Please login."}</span>
        }
        title="Unauthorized!"
      />
    )
  }

  return (
    <>
      <Head>
        <title>AnnoREP - Manuscript</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script src="https://hypothes.is/embed.js" async></script>
      </Head>
      <main>{content}</main>
    </>
  )
}

export default Manuscript

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const id = context?.params?.id
  let manuscript = null
  let errorMsg = null
  if (session && id) {
    try {
      const { status, data } = await axios({
        method: "GET",
        url: `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/pdf`,
        responseType: "arraybuffer",
        headers: {
          [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
          [REQUEST_DESC_HEADER_NAME]: `Getting ingest PDF file from source manuscript ${id}`,
          Accept: "application/pdf",
        },
      })
      if (status === 200) {
        manuscript = Buffer.from(data, "binary").toString("base64")
      }
    } catch (error) {
      const { status, message } = getResponseFromError(error)
      console.error(status, message)
      errorMsg = message
    }
  }
  return {
    props: {
      isLoggedIn: session ? true : false,
      manuscript,
      errorMsg,
    },
  }
}
