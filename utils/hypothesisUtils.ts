import { Dispatch } from "react"
import { AxiosResponse } from "axios"

import { axiosClient } from "../features/app"
import { ITaskAction, TaskActionType } from "../hooks/useTask/state"

import { ATI_HEADER_HTML } from "../constants/ati"
import { ANNOTATIONS_MAX_LIMIT, REQUEST_BATCH_SIZE } from "../constants/hypothesis"
import { range } from "./arrayUtils"

interface GetAnnotationsArgs {
  datasetId: string
  hypothesisGroup?: string
  isAdminDownloader: boolean
}
export async function getTotalAnnotations(args: GetAnnotationsArgs): Promise<number> {
  const { datasetId, hypothesisGroup, isAdminDownloader } = args
  const { data: totalAnns } = await axiosClient.get<{ total: number }>(
    `/api/hypothesis/${datasetId}/total-annotations`,
    {
      params: {
        hypothesisGroup,
        isAdminDownloader,
      },
      headers: {
        Accept: "application/json",
      },
    }
  )
  return totalAnns.total
}

export async function getAnnotations(args: GetAnnotationsArgs): Promise<any[]> {
  const { datasetId, hypothesisGroup, isAdminDownloader } = args
  const total = await getTotalAnnotations(args)

  const offsets = range(0, total - 1, ANNOTATIONS_MAX_LIMIT)
  const batches = range(0, offsets.length - 1, REQUEST_BATCH_SIZE)
  const responses = await batches.reduce((promise, start) => {
    return promise.then((acc) => {
      const downloadAnns = offsets.slice(start, start + REQUEST_BATCH_SIZE).map((offset) => {
        return axiosClient.get(`/api/hypothesis/${datasetId}/download-annotations`, {
          params: {
            offset,
            hypothesisGroup,
            isAdminDownloader,
            limit: ANNOTATIONS_MAX_LIMIT,
          },
          headers: {
            Accept: "application/json",
          },
        })
      })
      return Promise.all(downloadAnns).then((resp) => acc.concat(resp))
    })
  }, Promise.resolve<AxiosResponse<any>[]>([]))

  // 2d array
  const allRows = responses.map(({ data }) => data.rows)
  const annotations = [].concat(...allRows) as any[]
  return annotations
}

interface DeleteAnnotationsArgs {
  datasetId: string
  annotations: any[]
  isAdminAuthor: boolean
  taskDispatch?: Dispatch<ITaskAction>
}
export async function deleteAnnotations(args: DeleteAnnotationsArgs): Promise<number> {
  const { datasetId, annotations, isAdminAuthor, taskDispatch } = args
  let totalDeleted = 0
  const anns = annotations.map((ann: any) => {
    return {
      id: ann.id,
      permissions: { delete: ann.permissions.delete },
    }
  })
  const offsets = range(0, annotations.length - 1, REQUEST_BATCH_SIZE)
  for (const offset of offsets) {
    const toDeleteAnns = anns.slice(offset, offset + REQUEST_BATCH_SIZE)
    if (taskDispatch) {
      taskDispatch({
        type: TaskActionType.NEXT_STEP,
        payload: `Processing ${offset + 1} to ${Math.min(
          offset + REQUEST_BATCH_SIZE,
          annotations.length
        )} of ${annotations.length} annotations...`,
      })
    }
    const response = await axiosClient.delete<{ total: number }>(
      `/api/hypothesis/${datasetId}/delete-annotations`,
      {
        data: JSON.stringify({ isAdminAuthor, annotations: toDeleteAnns }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    totalDeleted += response.data.total
  }
  return totalDeleted
}

interface ExportAnnotationsArgs {
  datasetId: string
  sourceHypothesisGroup: string
  isAdminDownloader: boolean
  destinationUrl: string
  destinationHypothesisGroup: string
  privateAnnotation: boolean
  isAdminAuthor: boolean
  taskDispatch: Dispatch<ITaskAction>
  addQdrInfo?: {
    manuscriptId: string
    datasetDoi: string
  }
}
export async function exportAnnotations(args: ExportAnnotationsArgs): Promise<number> {
  const {
    datasetId,
    sourceHypothesisGroup,
    isAdminDownloader,
    destinationUrl,
    destinationHypothesisGroup,
    privateAnnotation,
    isAdminAuthor,
    taskDispatch,
    addQdrInfo,
  } = args
  const total = await getTotalAnnotations({
    datasetId,
    isAdminDownloader,
    hypothesisGroup: sourceHypothesisGroup,
  })
  let totalExported = 0
  const offsets = range(0, total - 1, REQUEST_BATCH_SIZE)
  for (const offset of offsets) {
    taskDispatch({
      type: TaskActionType.NEXT_STEP,
      payload: `Processing ${offset + 1} to ${Math.min(
        offset + REQUEST_BATCH_SIZE,
        total
      )} of ${total} annotations...`,
    })
    const response = await axiosClient.post<{ total: number }>(
      `/api/hypothesis/${datasetId}/export-annotations`,
      JSON.stringify({
        sourceHypothesisGroup,
        isAdminDownloader,
        offset,
        destinationUrl,
        destinationHypothesisGroup,
        isAdminAuthor,
        privateAnnotation,
        addQdrInfo: addQdrInfo ? true : false,
        limit: REQUEST_BATCH_SIZE,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    totalExported += response.data.total
  }
  if (addQdrInfo) {
    await axiosClient.post(`/api/hypothesis/${datasetId}/title-annotation`, {
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      manuscriptId: addQdrInfo.manuscriptId,
      datasetDoi: addQdrInfo.datasetDoi,
    })
  }
  return totalExported
}

export function createInitialAnnotationText(
  citation: string,
  doi: string,
  isDraftState: boolean
): string {
  const citationArr = citation.split(". ")
  if (isDraftState) {
    citationArr.pop()
  }
  return `${ATI_HEADER_HTML}This is an Annotation for Transparent Inquiry project, published by the <a href="https://qdr.syr.edu">Qualitative Data Repository</a>.

  <b>The <a href="${doi}">Data Overview</a> discusses project context, data generation and analysis, and logic of annotation.</b>
  
  Please cite as:

  ${citationArr.join(". ")}${isDraftState ? "." : ""}

  <a href="https://qdr.syr.edu/ati">Learn more about ATI here</a>.`
}
