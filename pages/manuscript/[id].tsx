import { FC, useState } from "react"

import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import axios from "axios"
import { SizeMe } from "react-sizeme"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

import { DATAVERSE_HEADER_NAME } from "../../constants/dataverse"

interface ManuscriptProps {
  session: any
  manuscript: string
}

const Manuscript: FC<ManuscriptProps> = ({ manuscript }) => {
  const [numPages, setNumPages] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  return (
    <>
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
                renderMode="svg"
              />
            ))}
          </Document>
        )}
      </SizeMe>
      <script src="https://hypothes.is/embed.js" async></script>
    </>
  )
}

export default Manuscript

// trystatic props but with dev api token
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  let manuscript = null
  if (session && context?.params?.id) {
    const { data } = await axios({
      method: "get",
      url: "http://www.africau.edu/images/default/sample.pdf",
      //url: `${session.serverUrl}/api/access/datafile/1864775`,
      responseType: "arraybuffer",
      headers: {
        [DATAVERSE_HEADER_NAME]: session.apiToken,
        //Accept: "application/pdf",
      },
    })
    manuscript = Buffer.from(data, "binary").toString("base64")
  }
  //get the id
  //axios download the pdf file from jim's api
  //pass it to probs
  return {
    props: {
      session,
      manuscript,
    },
  }
}
