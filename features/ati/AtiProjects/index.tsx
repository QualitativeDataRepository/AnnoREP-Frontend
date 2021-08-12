import { FC, useState } from "react"

import { Add16 } from "@carbon/icons-react"
import { PaginationNav, Button } from "carbon-components-react"
import Link from "next/link"

import AtiProject from "../AtiProject"

import { IAtiProject } from "../../../types/ati"

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
      <div className={styles.paginationDesc}>
        <Link href="/new">
          <Button as="a" href="/new" kind="primary" size="sm" renderIcon={Add16}>
            New ATI Project
          </Button>
        </Link>
        <div>{`${currentFirst} to ${currentLast} of ${atiProjects.length} project(s)`}</div>
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
