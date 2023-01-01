import { Dispatch } from "react"
import { AxiosResponse } from "axios"

import { axiosClient } from "../features/app"
import { ITaskAction, TaskActionType } from "../hooks/useTask/state"

import { ATI_HEADER_HTML } from "../constants/ati"
import { REQUEST_DESC_HEADER_NAME } from "../constants/http"
import {
  ANNOTATIONS_MAX_LIMIT,
  REQUEST_BATCH_SIZE,
  TOTAL_EXPORTED_ANNOTATIONS_LIMIT,
} from "../constants/hypothesis"
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
  addQdrInfo?: {
    manuscriptId: string
    datasetDoi: string
  }
  numberAnnotations: boolean
}
export async function exportAnnotations({
  datasetId,
  sourceHypothesisGroup,
  isAdminDownloader,
  destinationUrl,
  destinationHypothesisGroup,
  privateAnnotation,
  isAdminAuthor,
  addQdrInfo,
  numberAnnotations,
}: ExportAnnotationsArgs): Promise<number> {
  const { data } = await axiosClient.post<{ total: number }>(
    `/api/hypothesis/${datasetId}/export-annotations`,
    JSON.stringify({
      sourceHypothesisGroup,
      isAdminDownloader,
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      numberAnnotations,
      addQdrInfo,
      isAdminAuthor,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  if (addQdrInfo) {
    //TODO: copy the content the endpoint into a func
    await axiosClient.post(`/api/hypothesis/${datasetId}/title-annotation`, {
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      manuscriptId: addQdrInfo.manuscriptId,
      datasetDoi: addQdrInfo.datasetDoi,
    })
  }
  return data.total
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

interface ServerExportAnnotationsServerSideArgs {
  totalAnnotationsCount: number
  downloadApiUrl: string
  exportApiUrl: string
  sourceUrl: string
  destinationUrl: string
  sourceHypothesisGroup: string
  destinationHypothesisGroup: string
  downloadApiToken: string
  exportApiToken: string
  privateAnnotation: boolean
  addQdrInfo: boolean
  numberAnnotations: boolean
}
export async function serverExportAnnotations({
  totalAnnotationsCount,
  downloadApiUrl,
  exportApiUrl,
  sourceUrl,
  destinationUrl,
  sourceHypothesisGroup,
  destinationHypothesisGroup,
  downloadApiToken,
  exportApiToken,
  privateAnnotation,
  addQdrInfo,
  numberAnnotations,
}: ServerExportAnnotationsServerSideArgs) {
  if (numberAnnotations && totalAnnotationsCount > TOTAL_EXPORTED_ANNOTATIONS_LIMIT) {
    //TODO does the error correctly show in UI?
    throw new Error(
      `Found ${totalAnnotationsCount.toLocaleString(
        "en-US"
      )} annotations. AnnoREP can't number annotations for projects with more than ${TOTAL_EXPORTED_ANNOTATIONS_LIMIT.toLocaleString(
        "en-US"
      )} annotations.`
    )
  }
  const downloadOffsets = range(0, totalAnnotationsCount - 1, ANNOTATIONS_MAX_LIMIT)
  const downloadBatches = range(0, downloadOffsets.length - 1, REQUEST_BATCH_SIZE)
  let totalExportedCount = 0
  let sourceAnnotations: any[] = []
  for (const downloadBatch of downloadBatches) {
    const annotationsDataRows = await Promise.all(
      downloadOffsets.slice(downloadBatch, downloadBatch + REQUEST_BATCH_SIZE).map((offset) => {
        return downloadAnnotations({
          downloadApiUrl,
          sourceUrl,
          sourceHypothesisGroup,
          downloadApiToken,
          offset,
          limit: ANNOTATIONS_MAX_LIMIT,
        })
      })
    )

    const annotations = annotationsDataRows.flat()
    annotations.filter((annotation) => annotation.uri === sourceUrl)
    if (numberAnnotations) {
      sourceAnnotations = sourceAnnotations.concat(annotations)
    } else {
      const exportedCount = await copyAnnotations({
        sourceAnnotations: annotations,
        exportApiUrl,
        exportApiToken,
        destinationUrl,
        destinationHypothesisGroup,
        privateAnnotation,
        addQdrInfo,
        numberAnnotations,
      })
      totalExportedCount += exportedCount
    }
  }
  if (numberAnnotations) {
    //TODO sort the annotations
    totalAnnotationsCount = await copyAnnotations({
      sourceAnnotations,
      exportApiUrl,
      exportApiToken,
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      addQdrInfo,
      numberAnnotations,
    })
  }

  return totalExportedCount
}

type DownloadAnnotationsKeys =
  | "downloadApiUrl"
  | "sourceUrl"
  | "sourceHypothesisGroup"
  | "downloadApiToken"
interface DownloadAnnotationsArgs
  extends Pick<ServerExportAnnotationsServerSideArgs, DownloadAnnotationsKeys> {
  offset: number
  limit: number
}
async function downloadAnnotations({
  downloadApiUrl,
  sourceUrl,
  sourceHypothesisGroup,
  downloadApiToken,
  offset,
  limit,
}: DownloadAnnotationsArgs) {
  //TODO: check limit > 200
  const { data } = await axiosClient.get<{ rows: any[]; total: number }>(downloadApiUrl, {
    params: {
      limit,
      offset,
      uri: sourceUrl,
      group: sourceHypothesisGroup,
    },
    headers: {
      Authorization: `Bearer ${downloadApiToken}`,
      Accept: "application/json",
      [REQUEST_DESC_HEADER_NAME]: `Downloading ${sourceHypothesisGroup} annotations from ${sourceUrl} at offset ${offset}`,
    },
  })
  return data.rows
}

type CopyAnnotationsKeys =
  | "exportApiUrl"
  | "destinationUrl"
  | "destinationHypothesisGroup"
  | "exportApiToken"
  | "privateAnnotation"
  | "addQdrInfo"
  | "numberAnnotations"
interface CopyAnnotationsArgs
  extends Pick<ServerExportAnnotationsServerSideArgs, CopyAnnotationsKeys> {
  sourceAnnotations: any[]
}
async function copyAnnotations({
  sourceAnnotations,
  exportApiUrl,
  destinationUrl,
  destinationHypothesisGroup,
  exportApiToken,
  privateAnnotation,
  addQdrInfo,
  numberAnnotations,
}: CopyAnnotationsArgs): Promise<number> {
  const newAnnotations = sourceAnnotations.map((annotation, i) =>
    createNewAnnotation({
      sourceAnnotation: annotation,
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      addQdrInfo,
      newAnnotationPrefixIndex: numberAnnotations ? i + 1 /**1-index */ : null,
    })
  )

  let exportedCount = 0
  const exportOffsets = range(0, newAnnotations.length - 1, REQUEST_BATCH_SIZE)
  for (const exportOffset of exportOffsets) {
    const batchOfAnnotations = newAnnotations.slice(exportOffset, exportOffset + REQUEST_BATCH_SIZE)
    const copyAnns = batchOfAnnotations.map((annotation, i) => {
      return axiosClient({
        method: "POST",
        url: exportApiUrl,
        data: annotation,
        headers: {
          Authorization: `Bearer ${exportApiToken}`,
          "Content-type": "application/json",
          [REQUEST_DESC_HEADER_NAME]: `Copying annotation ${
            sourceAnnotations[exportOffset + i /**check */].id
          } to ${destinationUrl}`,
        },
      })
    })
    await Promise.all(copyAnns)
    exportedCount += batchOfAnnotations.length
  }
  return exportedCount
}

type CreateNewAnnotationKeys =
  | "destinationUrl"
  | "destinationHypothesisGroup"
  | "privateAnnotation"
  | "addQdrInfo"
interface CreateNewAnnotationArgs
  extends Pick<ServerExportAnnotationsServerSideArgs, CreateNewAnnotationKeys> {
  sourceAnnotation: any
  newAnnotationPrefixIndex: number | null
}
function createNewAnnotation({
  sourceAnnotation,
  destinationUrl,
  destinationHypothesisGroup,
  privateAnnotation,
  addQdrInfo,
  newAnnotationPrefixIndex,
}: CreateNewAnnotationArgs): string {
  sourceAnnotation.target.forEach((element: any) => {
    element.source = destinationUrl
  })
  let newReadPermission = sourceAnnotation.permissions.read
  if (!privateAnnotation) {
    newReadPermission = [`group:${destinationHypothesisGroup}`]
  }
  let newText = sourceAnnotation.text
  if (addQdrInfo) {
    newText = `${ATI_HEADER_HTML}${sourceAnnotation.text}`
  }

  if (newAnnotationPrefixIndex && newAnnotationPrefixIndex > 0) {
    //add number
    //what's the correct order here with regards to ATI_HEADER_HTML
  }

  return JSON.stringify({
    uri: destinationUrl,
    //document
    text: newText,
    tags: sourceAnnotation.tags,
    group: destinationHypothesisGroup,
    permissions: { read: newReadPermission },
    target: sourceAnnotation.target,
    //references
  })
}
