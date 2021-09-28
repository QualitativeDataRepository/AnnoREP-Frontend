import React, { FC, FormEventHandler } from "react"

import {
  PaginationNav,
  Search,
  Form,
  FormGroup,
  Checkbox,
  InlineLoading,
} from "carbon-components-react"

import AtiProject from "../AtiProject"
import useSearch from "./useSearch"
import {
  getAtis,
  getTotalPages,
  getShowPagination,
  getLoadingDesc,
  getLoadingIconDesc,
} from "./selectors"

import { PUBLICATION_STATUS_NAME } from "../../../constants/dataverse"
import { IAtiProject } from "../../../types/ati"
import { getLabelTextForPublicationStatus } from "./utils"

import styles from "./AtiProjects.module.css"

export interface AtiProjectsProps {
  /** The list of ati projects */
  atiProjects: IAtiProject[]
  /** The initial number of total ati projects found */
  initialTotalCount: number
  /** The number of the ati project to show per page */
  atisPerPage: number
  /** Publication status count of the list of ati projects */
  publicationStatusCount: Record<string, number>
  /** Facets to filter the ati projects */
  selectedFilters: Record<string, string[]>
}

/** A user's ati projects with a search bar */
const AtiProjects: FC<AtiProjectsProps> = ({
  atiProjects,
  initialTotalCount,
  atisPerPage,
  publicationStatusCount,
  selectedFilters,
}) => {
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
    selectedPublicationStatuses: selectedFilters["publication_statuses"].reduce((acc, curr) => {
      acc[curr] = true
      return acc
    }, {} as Record<string, boolean>),
    selectedFilters: selectedFilters,
    publicationStatusCount: publicationStatusCount,
    fetchPublicationStatus: false,
  })
  const onCurrentPageChange = (page: number) => dispatch({ type: "UPDATE_PAGE", payload: page })
  const onSearch: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      atiSearch: { value: string }
    }
    dispatch({ type: "UPDATE_Q", payload: target.atiSearch.value.trim() })
  }
  const onFacetFieldChange = (checked: boolean, id: string) =>
    dispatch({ type: "UPDATE_SELECTED_PUBLICATION_STATUS", payload: { id, checked } })

  const totalPages = getTotalPages(state)
  const loadingDesc = getLoadingDesc(state)
  const loadingIconDesc = getLoadingIconDesc(state)
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
      <div className={styles.resultContainer}>
        <Form>
          <FormGroup legendText={PUBLICATION_STATUS_NAME}>
            {selectedFilters[PUBLICATION_STATUS_NAME.toLowerCase().split(" ").join("_")].map(
              (status: string) => {
                return (
                  <Checkbox
                    key={status}
                    id={status}
                    name={status}
                    checked={state.selectedPublicationStatuses[status]}
                    labelText={getLabelTextForPublicationStatus(
                      status,
                      state.publicationStatusCount
                    )}
                    onChange={onFacetFieldChange}
                  />
                )
              }
            )}
          </FormGroup>
        </Form>
        <div className={styles.atiContainer}>
          <InlineLoading
            id="ati-search-results-status"
            status={state.status}
            description={loadingDesc}
            iconDescription={loadingIconDesc}
          />
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
        </div>
      </div>
    </>
  )
}

export default AtiProjects
