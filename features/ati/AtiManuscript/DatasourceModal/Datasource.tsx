import { FC, useRef, useState, useEffect } from "react"

import styles from "./Datasource.module.css"

interface DatasourceProps {
  name: string
}

const Datasource: FC<DatasourceProps> = ({ name }) => {
  const ref = useRef<HTMLParagraphElement>(null)
  const [requireTitle, setRequireTitle] = useState(false)

  useEffect(() => {
    if (ref.current) {
      const element = ref.current
      if (element.scrollWidth > element.clientWidth) {
        // name is too long
        setRequireTitle(true)
      }
    }
  }, [])

  return (
    <p ref={ref} title={requireTitle ? name : undefined} className={styles.datasource}>
      {name}
    </p>
  )
}

export default Datasource
