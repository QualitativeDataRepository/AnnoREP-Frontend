import React, { FC } from "react"

import { Add16 } from "@carbon/icons-react"
import { PaginationNav, Button, InlineNotification } from "carbon-components-react"
import Link from "next/link"

import AtiProject from "../AtiProject"
import useSearch from "./useSearch"

import {
  getStart,
  getEnd,
  getAtis,
  getTotalPages,
  getShowPagination,
  getInlineNotficationKind,
  getInlineNotficationSubtitle,
  getInlineNotficationTitle,
} from "./selectors"

import { IAtiProject } from "../../../types/ati"

import styles from "./AtiProjects.module.css"

export interface AtiProjectsProps {
  atiProjects: IAtiProject[]
  totalCount: number
}

const AtiProjects: FC<AtiProjectsProps> = ({ atiProjects, totalCount }) => {
  const [state, dispatch] = useSearch({
    currentTotal: atiProjects.length,
    totalCount: totalCount,
    status: "inactive",
    error: "",
    atiProjects: atiProjects.reduce((acc, curr, i) => {
      acc[i] = curr
      return acc
    }, {} as Record<number, IAtiProject>),
    page: 0,
  })
  const onCurrentPageChange = (page: number) => dispatch({ type: "UPDATE_PAGE", payload: page })

  const start = getStart(state)
  const end = getEnd(state)
  const totalPages = getTotalPages(state)
  const inlineNotificationKind = getInlineNotficationKind(state)
  const inlineNotificationSubtitle = getInlineNotficationSubtitle(state)
  const inlineNotficationTitle = getInlineNotficationTitle(state)
  const atis = getAtis(state)
  const showPagination = getShowPagination(state)
  return (
    <>
      <div className={styles.paginationDesc}>
        <Link href="/new">
          <Button as="a" href="/new" kind="primary" size="sm" renderIcon={Add16}>
            New ATI Project
          </Button>
        </Link>
        <div>{`${start} to ${end} of ${totalCount} project(s)`}</div>
      </div>
      {state.status !== "inactive" && (
        <InlineNotification
          lowContrast
          kind={inlineNotificationKind}
          subtitle={<span>{inlineNotificationSubtitle}</span>}
          title={inlineNotficationTitle}
        />
      )}
      {atis.map(({ id, title, description, version, status }) => (
        <AtiProject
          key={id}
          id={id}
          title={title}
          description={description}
          version={version}
          status={status}
        />
      ))}
      {showPagination && (
        <PaginationNav
          loop={false}
          page={state.page}
          totalItems={totalPages}
          onChange={onCurrentPageChange}
        />
      )}
    </>
  )
}

export default AtiProjects
