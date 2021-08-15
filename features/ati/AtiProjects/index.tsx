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
  atisPerPage: number
  publicationStatusCount: any
  selectedFilters: any
}

const AtiProjects: FC<AtiProjectsProps> = ({ atiProjects, initialTotalCount, atisPerPage }) => {
  const [state, dispatch] = useSearch({
    currentTotal: atiProjects.length,
    totalCount: initialTotalCount,
    atiProjects: atiProjects.reduce((acc, curr, i) => {
      acc[i] = curr
      return acc
    }, {} as Record<number, IAtiProject>),
    status: "inactive",
    page: 0,
    perPage: atisPerPage,
    q: "",
    fetchQ: false,
    error: "",
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
      {showResultDesc && (
        <div
          className={styles.searchResultDesc}
        >{`${start} to ${end} of ${totalCount} project(s)`}</div>
      )}
      {state.status !== "inactive" && (
        <InlineNotification
          lowContrast
          kind={inlineNotificationKind}
          subtitle={<span>{inlineNotificationSubtitle}</span>}
          title={inlineNotficationTitle}
        />
      )}
      {atis.map(
        ({
          id,
          name,
          description,
          dateDisplay,
          dataverseName,
          citationHtml,
          publicationStatuses,
          userRoles,
          dataverseServerUrl,
          dataverse,
        }) => (
          <AtiProject
            key={id}
            id={id}
            name={name}
            description={description}
            dateDisplay={dateDisplay}
            dataverseName={dataverseName}
            citationHtml={citationHtml}
            publicationStatuses={publicationStatuses}
            userRoles={userRoles}
            dataverseServerUrl={dataverseServerUrl}
            dataverse={dataverse}
          />
        )
      )}
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
