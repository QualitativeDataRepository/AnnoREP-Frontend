import React, { FC, useState } from "react"

import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableToolbar,
  TableBatchActions,
  TableBatchAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarAction,
  TableSelectAll,
  TableSelectRow,
} from "carbon-components-react"

import { Delete16 as Delete } from "@carbon/icons-react"
import { IDatasource } from "../../../types/dataverse"

import layoutStyles from "../../components/Layout/Layout.module.css"

export interface IDataSourceRow extends IDatasource {
  selected: boolean
}

export interface AtiDatasourcesProps {
  atiProject: string
  datasources: IDatasource[]
  handleSave(datasources: IDatasource[]): void
}

const headers = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "uri",
    header: "URI",
  },
]

//add callbacks to delete upload

/**ATI Datasources */
const AtiDatasources: FC<AtiDatasourcesProps> = ({ atiProject, datasources }) => {
  const [datasourceRows] = useState<IDatasource[]>(datasources)
  const [, setShowAddFilesModal] = useState<boolean>(false)
  return (
    <div className={layoutStyles.maxwidth}>
      <DataTable
        rows={datasourceRows}
        headers={headers}
        useZebraStyles
        size="normal"
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getBatchActionProps,
          getToolbarProps,
          getTableContainerProps,
          getSelectionProps,
          selectedRows,
        }) => (
          <TableContainer
            title={atiProject}
            description="Datasources"
            {...getTableContainerProps()}
          >
            <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
              <TableBatchActions {...getBatchActionProps()}>
                <TableBatchAction
                  tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                  renderIcon={Delete}
                >
                  Delete
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarMenu light>
                  <TableToolbarAction onClick={() => setShowAddFilesModal(true)}>
                    Add new
                  </TableToolbarAction>
                </TableToolbarMenu>
                <Button>Save</Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    <TableSelectRow
                      {...getSelectionProps({ row })}
                      checked={
                        selectedRows.find((selectedRow) => row.id === selectedRow.id) ? true : false
                      }
                      disabled={false}
                    />
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  )
}

export default AtiDatasources
