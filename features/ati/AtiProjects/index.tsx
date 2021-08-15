import React, { FC, FormEventHandler } from "react"

import { PaginationNav, InlineNotification, Search, Form } from "carbon-components-react"

import AtiProject from "../AtiProject"
import useSearch from "./useSearch"

import {
  getStart,
  getEnd,
  getAtis,
  getTotalCount,
  getTotalPages,
  getShowPagination,
  getInlineNotficationKind,
  getInlineNotficationSubtitle,
  getInlineNotficationTitle,
  getShowResultDesc,
} from "./selectors"

import { IAtiProject } from "../../../types/ati"

import styles from "./AtiProjects.module.css"

export interface AtiProjectsProps {
  atiProjects: IAtiProject[]
  initialTotalCount: number
}

const AtiProjects: FC<AtiProjectsProps> = ({ atiProjects, initialTotalCount }) => {
  const [state, dispatch] = useSearch({
    currentTotal: atiProjects.length,
    totalCount: initialTotalCount,
    status: "inactive",
    error: "",
    atiProjects: atiProjects.reduce((acc, curr, i) => {
      acc[i] = curr
      return acc
    }, {} as Record<number, IAtiProject>),
    page: 0,
    q: "*",
  })
  const onCurrentPageChange = (page: number) => dispatch({ type: "UPDATE_PAGE", payload: page })
  const onSearch: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      atiSearch: { value: string }
    }
    dispatch({ type: "UPDATE_Q", payload: target.atiSearch.value.trim() })
  }

  const start = getStart(state)
  const end = getEnd(state)
  const totalCount = getTotalCount(state)
  const totalPages = getTotalPages(state)
  const showResultDesc = getShowResultDesc(state)
  const inlineNotificationKind = getInlineNotficationKind(state)
  const inlineNotificationSubtitle = getInlineNotficationSubtitle(state)
  const inlineNotficationTitle = getInlineNotficationTitle(state)
  const atis = getAtis(state)
  const showPagination = getShowPagination(state)
  return (
    <>
      <Form onSubmit={onSearch}>
        <Search
          id="ati-search"
          name="atiSearch"
          labelText="Search"
          placeholder="Search"
          closeButtonLabelText="Clear search input"
          size="lg"
        />
      </Form>
      {state.status !== "inactive" && (
        <InlineNotification
          lowContrast
          kind={inlineNotificationKind}
          subtitle={<span>{inlineNotificationSubtitle}</span>}
          title={inlineNotficationTitle}
        />
      )}
      {showResultDesc && (
        <div
          className={styles.searchResultDesc}
        >{`${start} to ${end} of ${totalCount} project(s)`}</div>
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
