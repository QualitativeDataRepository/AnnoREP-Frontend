import { FC, useState } from "react"
import { PaginationNav } from "carbon-components-react"
import { IAtiProject } from "../../../types/ati"

import AtiProject from "../AtiProject"

import styles from "./AtiProjects.module.css"

export interface AtiProjectsProps {
  atiProjects: IAtiProject[]
}

const NUMBER_OF_ATI_PROJECTS_PER_PAGE = 10

const AtiProjects: FC<AtiProjectsProps> = ({ atiProjects }) => {
  const [currentPage, setCurrentPage] = useState<number>(0)
  const onCurrentPageChange = (page: number) => setCurrentPage(page)
  const activeAtiProjects = atiProjects.slice(
    NUMBER_OF_ATI_PROJECTS_PER_PAGE * currentPage,
    NUMBER_OF_ATI_PROJECTS_PER_PAGE * currentPage + NUMBER_OF_ATI_PROJECTS_PER_PAGE
  )
  const totalPages = Math.ceil(atiProjects.length / NUMBER_OF_ATI_PROJECTS_PER_PAGE)
  const currentFirst = NUMBER_OF_ATI_PROJECTS_PER_PAGE * currentPage + 1
  const currentLast = Math.min(
    atiProjects.length,
    NUMBER_OF_ATI_PROJECTS_PER_PAGE * currentPage + NUMBER_OF_ATI_PROJECTS_PER_PAGE
  )
  return (
    <>
      <div className={styles.pageContainer}>
        <span
          className={styles.currentPageDesc}
        >{`${currentFirst} to ${currentLast} of ${atiProjects.length} project(s)`}</span>
      </div>
      {activeAtiProjects.map(({ id, title, version, status }) => (
        <AtiProject key={id} id={id} title={title} version={version} status={status} />
      ))}
      {totalPages > 1 && (
        <PaginationNav
          loop={false}
          page={currentPage}
          totalItems={totalPages}
          onChange={onCurrentPageChange}
        />
      )}
    </>
  )
}

export default AtiProjects
