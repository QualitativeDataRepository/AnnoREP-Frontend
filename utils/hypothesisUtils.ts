import { Dispatch } from "react"

import { axiosClient } from "../features/app"
import { ITaskAction, TaskActionType } from "../hooks/useTask/state"

import { ATI_HEADER_HTML } from "../constants/ati"
import {
  ANNOTATIONS_MAX_LIMIT,
  REQUEST_BATCH_SIZE,
  TOTAL_EXPORTED_ANNOTATIONS_LIMIT,
} from "../constants/hypothesis"
import { IHypothesisAnnotation, IHypothesisPostAnnotationBodySchema } from "../types/hypothesis"
import { range } from "./arrayUtils"

export async function getTotalAnnotationsCount({
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
}: SearchForAnnotationsArgs): Promise<number> {
  const params = {
    isAdminDownloader,
    sourceHypothesisGroup,
    limit: 1,
  }
  const { data } = await axiosClient.get<{ total: number }>(
    `/api/hypothesis/${datasetId}/download-annotations`,
    {
      params,
      headers: {
        Accept: "application/json",
      },
    }
  )
  return data.total
}

export async function getTotalAnnotations({
  totalAnnotationsCount,
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
}: GetTotalAnnotationsArgs): Promise<IHypothesisAnnotation[]> {
  const sort = "created"
  const order = "asc"
  let searchAfter: string | undefined

  const totalBatchesCount = Math.ceil(totalAnnotationsCount / ANNOTATIONS_MAX_LIMIT)
  let batchCount = 0

  let sourceAnnotations: IHypothesisAnnotation[] = []
  while (batchCount < totalBatchesCount) {
    batchCount++
    const annotations = await batchSearchForAnnotations({
      datasetId,
      isAdminDownloader,
      sourceHypothesisGroup,
      sort,
      order,
      searchAfter,
      limit: ANNOTATIONS_MAX_LIMIT,
    })
    sourceAnnotations = sourceAnnotations.concat(annotations)
    searchAfter = annotations[annotations.length - 1][sort]
  }

  return sourceAnnotations
}

export async function deleteAnnotations(args: DeleteAnnotationsArgs): Promise<number> {
  const { datasetId, annotations, isAdminAuthor, taskDispatch } = args
  let totalDeleted = 0
  const anns = annotations.map((ann) => {
    return {
      id: ann.id,
      permissions: { delete: ann.permissions.delete },
    }
  })
  const offsets = range(0, anns.length - 1, REQUEST_BATCH_SIZE)
  for (const offset of offsets) {
    const toDeleteAnns = anns.slice(offset, offset + REQUEST_BATCH_SIZE)
    if (taskDispatch) {
      taskDispatch({
        type: TaskActionType.NEXT_STEP,
        payload: generateProcessingBatchMesssage(
          offset + 1,
          Math.min(offset + REQUEST_BATCH_SIZE, anns.length),
          anns.length
        ),
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

export async function exportAnnotations({
  datasetId,
  isAdminDownloader,
  isAdminAuthor,
  destinationUrl,
  sourceHypothesisGroup,
  destinationHypothesisGroup,
  privateAnnotation,
  addQdrInfo,
  numberAnnotations,
  taskDispatch,
}: ExportAnnotationsArgs): Promise<number> {
  const totalExportedCount = numberAnnotations
    ? await exportAnnotationsWithNumberAnnotations({
        datasetId,
        isAdminDownloader,
        isAdminAuthor,
        destinationUrl,
        sourceHypothesisGroup,
        destinationHypothesisGroup,
        privateAnnotation,
        addQdrInfo,
        taskDispatch,
      })
    : await exportAnnotationsWithoutNumberAnnotations({
        datasetId,
        isAdminDownloader,
        isAdminAuthor,
        destinationUrl,
        sourceHypothesisGroup,
        destinationHypothesisGroup,
        privateAnnotation,
        addQdrInfo,
        taskDispatch,
      })

  if (addQdrInfo) {
    await axiosClient.post(
      `/api/hypothesis/${datasetId}/title-annotation`,
      JSON.stringify({
        destinationUrl,
        destinationHypothesisGroup,
        privateAnnotation,
        manuscriptId: addQdrInfo.manuscriptId,
        datasetDoi: addQdrInfo.datasetDoi,
      }),
      {
        headers: {
          "Content-type": "application/json",
        },
      }
    )
  }

  return totalExportedCount
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

async function exportAnnotationsWithNumberAnnotations({
  datasetId,
  isAdminDownloader,
  isAdminAuthor,
  destinationUrl,
  sourceHypothesisGroup,
  destinationHypothesisGroup,
  privateAnnotation,
  addQdrInfo,
  taskDispatch,
}: Omit<ExportAnnotationsArgs, "numberAnnotations">): Promise<number> {
  const totalAnnotationsCount = await getTotalAnnotationsCount({
    datasetId,
    isAdminDownloader,
    sourceHypothesisGroup,
  })
  if (totalAnnotationsCount > TOTAL_EXPORTED_ANNOTATIONS_LIMIT) {
    throw new Error(
      `Found ${totalAnnotationsCount.toLocaleString(
        "en-US"
      )} annotations. AnnoREP can't number annotations for projects with more than ${TOTAL_EXPORTED_ANNOTATIONS_LIMIT.toLocaleString(
        "en-US"
      )} annotations.`
    )
  }
  const sourceAnnotations = await getTotalAnnotations({
    totalAnnotationsCount,
    datasetId,
    isAdminDownloader,
    sourceHypothesisGroup,
  })
  sourceAnnotations.sort(annotationLocationCompareFn)
  const newAnnotations = sourceAnnotations.map((sourceAnnotation, i) => {
    return createNewAnnotation({
      sourceAnnotation,
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      addQdrInfo,
      newAnnotationPrefixIndex: i + 1,
    })
  })
  let totalExportedCount = 0
  const exportOffsets = range(0, newAnnotations.length - 1, REQUEST_BATCH_SIZE)
  for (const exportOffset of exportOffsets) {
    if (taskDispatch) {
      taskDispatch({
        type: TaskActionType.NEXT_STEP,
        payload: generateProcessingBatchMesssage(
          exportOffset + 1,
          Math.min(exportOffset + REQUEST_BATCH_SIZE, newAnnotations.length),
          newAnnotations.length
        ),
      })
    }
    const batchOfNewAnnotations = newAnnotations.slice(
      exportOffset,
      exportOffset + REQUEST_BATCH_SIZE
    )
    const exportedCount = await batchPostAnnotations({
      datasetId,
      newAnnotations: batchOfNewAnnotations,
      isAdminAuthor,
    })
    totalExportedCount += exportedCount
  }

  return totalExportedCount
}

async function exportAnnotationsWithoutNumberAnnotations({
  datasetId,
  isAdminDownloader,
  isAdminAuthor,
  destinationUrl,
  sourceHypothesisGroup,
  destinationHypothesisGroup,
  privateAnnotation,
  addQdrInfo,
  taskDispatch,
}: Omit<ExportAnnotationsArgs, "numberAnnotations">): Promise<number> {
  const totalAnnotationsCount = await getTotalAnnotationsCount({
    datasetId,
    isAdminDownloader,
    sourceHypothesisGroup,
  })

  const sort = "created"
  const order = "asc"
  let searchAfter: string | undefined

  const totalBatchesCount = Math.ceil(totalAnnotationsCount / REQUEST_BATCH_SIZE)
  let batchCount = 0

  let totalExportedCount = 0

  while (batchCount < totalBatchesCount) {
    if (taskDispatch) {
      taskDispatch({
        type: TaskActionType.NEXT_STEP,
        payload: generateProcessingBatchMesssage(
          batchCount * REQUEST_BATCH_SIZE + 1,
          Math.min(batchCount * REQUEST_BATCH_SIZE + REQUEST_BATCH_SIZE, totalAnnotationsCount),
          totalAnnotationsCount
        ),
      })
    }
    const annotations = await batchSearchForAnnotations({
      datasetId,
      isAdminDownloader,
      sourceHypothesisGroup,
      sort,
      order,
      searchAfter,
      limit: REQUEST_BATCH_SIZE,
    })
    searchAfter = annotations[annotations.length - 1][sort]

    const newAnnotations = annotations.map((sourceAnnotation) => {
      return createNewAnnotation({
        sourceAnnotation,
        destinationUrl,
        destinationHypothesisGroup,
        privateAnnotation,
        addQdrInfo,
        newAnnotationPrefixIndex: null,
      })
    })
    const exportedCount = await batchPostAnnotations({
      newAnnotations,
      datasetId,
      isAdminAuthor,
    })
    totalExportedCount += exportedCount
    batchCount++
  }

  return totalExportedCount
}

async function batchSearchForAnnotations({
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
  sort,
  order,
  searchAfter,
  limit,
}: BatchSearchForAnnotationsArgs): Promise<IHypothesisAnnotation[]> {
  const params = {
    isAdminDownloader,
    sourceHypothesisGroup,
    sort,
    order,
    searchAfter,
    limit,
  }
  const { data } = await axiosClient.get<{ rows: IHypothesisAnnotation[] }>(
    `/api/hypothesis/${datasetId}/download-annotations`,
    {
      params,
      headers: {
        Accept: "application/json",
      },
    }
  )
  return data.rows
}

async function batchPostAnnotations({
  newAnnotations,
  datasetId,
  isAdminAuthor,
}: BatchPostAnnotationsArgs): Promise<number> {
  const postData = {
    newAnnotations,
    isAdminAuthor,
  }
  const { data } = await axiosClient.post<{ total: number }>(
    `/api/hypothesis/${datasetId}/export-annotations`,
    JSON.stringify(postData),
    {
      headers: {
        "Content-type": "application/json",
      },
    }
  )
  return data.total
}

function createNewAnnotation({
  sourceAnnotation,
  destinationUrl,
  destinationHypothesisGroup,
  privateAnnotation,
  addQdrInfo,
  newAnnotationPrefixIndex,
}: CreateNewAnnotationArgs): { sourceId: string; data: IHypothesisPostAnnotationBodySchema } {
  sourceAnnotation.target.forEach((element) => {
    element.source = destinationUrl
  })
  let newReadPermission = sourceAnnotation.permissions.read
  if (!privateAnnotation) {
    newReadPermission = [`group:${destinationHypothesisGroup}`]
  }

  let newText = sourceAnnotation.text
  if (newAnnotationPrefixIndex && newAnnotationPrefixIndex > 0) {
    newText = `<b>AN${newAnnotationPrefixIndex}</b><br><br>${newText}`
  }
  if (addQdrInfo) {
    newText = `${ATI_HEADER_HTML}${newText}`
  }

  return {
    sourceId: sourceAnnotation.id,
    data: {
      uri: destinationUrl,
      //document
      text: newText,
      tags: sourceAnnotation.tags,
      group: destinationHypothesisGroup,
      //other permission types default to the user only
      permissions: { read: newReadPermission },
      target: sourceAnnotation.target,
      //references
    },
  }
}

//https://github.com/hypothesis/client/blob/main/src/sidebar/helpers/thread-sorters.js#L87
function annotationLocationCompareFn(a: any, b: any): number {
  const aLocation = getLocationOfAnnotation(a)
  const bLocation = getLocationOfAnnotation(b)
  return Math.sign(aLocation - bLocation)
}

//https://github.com/hypothesis/client/blob/main/src/sidebar/helpers/annotation-metadata.js#L319
function getLocationOfAnnotation(annotation: any): number {
  const targets = annotation.target
  for (const selector of targets[0]?.selector ?? []) {
    if (selector.type === "TextPositionSelector") {
      return selector.start
    }
  }
  return Number.MAX_SAFE_INTEGER
}

function generateProcessingBatchMesssage(start: number, end: number, total: number) {
  return `Processing ${start.toLocaleString("en-US")} to ${end.toLocaleString(
    "en-US"
  )} of ${total.toLocaleString("en-US")} annotations...`
}

interface SearchForAnnotationsArgs {
  datasetId: string
  isAdminDownloader: boolean
  sourceHypothesisGroup?: string
}

interface GetTotalAnnotationsArgs extends SearchForAnnotationsArgs {
  totalAnnotationsCount: number
}

interface BatchSearchForAnnotationsArgs extends SearchForAnnotationsArgs {
  sort: string
  order: string
  searchAfter?: string
  limit: number
}

interface DeleteAnnotationsArgs {
  datasetId: string
  annotations: IHypothesisAnnotation[]
  isAdminAuthor: boolean
  taskDispatch?: Dispatch<ITaskAction>
}

interface PostAnnotationArgs {
  datasetId: string
  isAdminAuthor: boolean
}

interface BatchPostAnnotationsArgs extends PostAnnotationArgs {
  newAnnotations: { sourceId: string; data: IHypothesisPostAnnotationBodySchema }[]
  //batchStart: number
  //totalAnnotationsCount: number
  //taskDispatch?: Dispatch<ITaskAction>
}

interface NewAnnotationConfigs {
  destinationUrl: string
  destinationHypothesisGroup: string
  privateAnnotation: boolean
  addQdrInfo: { datasetDoi: string; manuscriptId: string } | false
}
interface CreateNewAnnotationArgs extends NewAnnotationConfigs {
  sourceAnnotation: IHypothesisAnnotation
  newAnnotationPrefixIndex: number | null
}

interface ExportAnnotationsArgs
  extends Required<SearchForAnnotationsArgs>,
    PostAnnotationArgs,
    NewAnnotationConfigs {
  numberAnnotations: boolean
  taskDispatch?: Dispatch<ITaskAction>
}
