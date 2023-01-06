import { Dispatch } from "react"
import qs from "qs"

import { axiosClient } from "../features/app"
import { ITaskAction, TaskActionType } from "../hooks/useTask/state"

import { ATI_HEADER_HTML } from "../constants/ati"
import {
  DATASET_DV_TYPE,
  DATAVERSE_HEADER_NAME,
  PUBLICATION_STATUSES,
} from "../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../constants/http"
import {
  ANNOTATIONS_MAX_LIMIT,
  REQUEST_BATCH_SIZE,
  TOTAL_EXPORTED_ANNOTATIONS_LIMIT,
} from "../constants/hypothesis"
import { range } from "./arrayUtils"

interface SearchForAnnotationsArgs {
  datasetId: string
  isAdminDownloader: boolean
  sourceHypothesisGroup?: string
}

export async function getTotalAnnotationsCount({
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
}: SearchForAnnotationsArgs): Promise<number> {
  const params = {
    isAdminDownloader,
    sourceHypothesisGroup,
  }
  const { data } = await axiosClient.get<{ total: number }>(
    `/api/hypothesis/${datasetId}/total-annotations`,
    {
      params,
      headers: {
        Accept: "application/json",
      },
    }
  )
  return data.total
}

interface GetTotalAnnotationsArgs extends SearchForAnnotationsArgs {
  totalAnnotationsCount: number
}
export async function getTotalAnnotations({
  totalAnnotationsCount,
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
}: GetTotalAnnotationsArgs): Promise<any[]> {
  const sort = "created"
  const order = "desc"
  let searchAfter: string | undefined

  const totalBatchesCount = Math.ceil(totalAnnotationsCount / ANNOTATIONS_MAX_LIMIT)
  let batchCount = 0

  let sourceAnnotations: any[] = []
  while (batchCount < totalBatchesCount) {
    batchCount++
    const annotations = await downloadAnnotations({
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

interface PostAnnotationArgs {
  datasetId: string
  isAdminAuthor: boolean
  destinationUrl: string
  destinationHypothesisGroup: string
  privateAnnotation: boolean
  addQdrInfo: { datasetDoi: string; manuscriptId: string } | false
  numberAnnotations: boolean
}
interface ExportAnnotationsArgs extends Required<SearchForAnnotationsArgs>, PostAnnotationArgs {
  //taskDispatch
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
}: //add back task dispatch
ExportAnnotationsArgs): Promise<number> {
  const totalAnnotationsCount = await getTotalAnnotationsCount({
    datasetId,
    isAdminDownloader,
    sourceHypothesisGroup,
  })
  if (numberAnnotations && totalAnnotationsCount > TOTAL_EXPORTED_ANNOTATIONS_LIMIT) {
    //task dipatch error
  }

  const sort = "created"
  const order = "asc"
  let searchAfter: string | undefined //need to init?

  const totalBatchesCount = Math.ceil(totalAnnotationsCount / ANNOTATIONS_MAX_LIMIT)
  let batchCount = 0

  let totalExportedCount = 0
  let sourceAnnotations: any[] = []

  while (batchCount < totalBatchesCount) {
    batchCount++
    const annotations = await downloadAnnotations({
      datasetId,
      isAdminDownloader,
      sourceHypothesisGroup,
      sort,
      order,
      searchAfter,
      limit: ANNOTATIONS_MAX_LIMIT,
    })
    searchAfter = annotations[annotations.length - 1][sort]

    if (numberAnnotations) {
      //accumulate all the source annotations
      sourceAnnotations = sourceAnnotations.concat(annotations)
    } else {
      //export the anotations
      const exportedCount = await copyAnnotations({
        sourceAnnotations: annotations,
        datasetId,
        isAdminAuthor,
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
    //sort annotations by location
    sourceAnnotations.sort(annotationLocationCompareFn)
    //export annotations
    totalExportedCount = await copyAnnotations({
      datasetId,
      sourceAnnotations,
      isAdminAuthor,
      destinationUrl,
      destinationHypothesisGroup,
      privateAnnotation,
      addQdrInfo,
      numberAnnotations,
    })
  }
  if (addQdrInfo) {
    //post title ann
  }

  return totalExportedCount
}

interface ServerPostTitleAnnotationArgs {
  dataverseApiToken: string
  hypothesisApiToken: string
  hypothesisUserId: string
  destinationUrl: string
  destinationHypothesisGroup: string
  manuscriptId: string
  datasetDoi: string
  privateAnnotation: boolean
}
export async function serverPostTitleAnnotation({
  dataverseApiToken,
  hypothesisApiToken,
  hypothesisUserId,
  destinationUrl,
  destinationHypothesisGroup,
  manuscriptId,
  datasetDoi,
  privateAnnotation,
}: ServerPostTitleAnnotationArgs): Promise<void> {
  const [titleAnnResponse, myDataResponse] = await Promise.all([
    axiosClient.get(`${process.env.ARCORE_SERVER_URL}/api/documents/${manuscriptId}/titleann`, {
      headers: {
        [DATAVERSE_HEADER_NAME]: dataverseApiToken,
        [REQUEST_DESC_HEADER_NAME]: `Getting title annotation from source manuscript ${manuscriptId}`,
      },
    }),
    axiosClient.get(`${process.env.DATAVERSE_SERVER_URL}/api/mydata/retrieve`, {
      params: {
        key: dataverseApiToken,
        dvobject_types: DATASET_DV_TYPE,
        published_states: PUBLICATION_STATUSES,
        mydata_search_term: `"${datasetDoi}"`,
      },
      paramsSerializer: (params) => {
        return qs.stringify(params, { indices: false })
      },
      headers: {
        [REQUEST_DESC_HEADER_NAME]: `Searching for data project ${datasetDoi}`,
      },
    }),
  ])

  if (!myDataResponse.data.success || myDataResponse.data.data.items.length === 0) {
    throw new Error(`Unable to find data project ${datasetDoi} to get its citation.`)
  }
  const dataset = myDataResponse.data.data.items[0]
  const citationHtml = dataset.citationHtml
  const doiUrl = dataset.url
  const isDraftState = dataset.is_draft_state

  const annotation = titleAnnResponse.data
  annotation.target.forEach((element: any) => {
    element.source = destinationUrl
  })
  let newReadPermission = [hypothesisUserId]
  if (!privateAnnotation) {
    newReadPermission = [`group:${destinationHypothesisGroup}`]
  }
  await axiosClient.post(
    `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
    JSON.stringify({
      uri: destinationUrl,
      document: annotation.document,
      text: createInitialAnnotationText(citationHtml, doiUrl, isDraftState),
      target: annotation.target,
      group: destinationHypothesisGroup,
      permissions: { read: newReadPermission },
    }),
    {
      headers: {
        Authorization: `Bearer ${hypothesisApiToken}`,
        "Content-type": "application/json",
        [REQUEST_DESC_HEADER_NAME]: `Sending title annotation from source manuscript ${manuscriptId} to Hypothes.is server`,
      },
    }
  )
}
function createInitialAnnotationText(citation: string, doi: string, isDraftState: boolean): string {
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

interface DownloadAnnotationsArgs extends SearchForAnnotationsArgs {
  sort: string
  order: string
  searchAfter?: string
  limit: number
}
async function downloadAnnotations({
  datasetId,
  isAdminDownloader,
  sourceHypothesisGroup,
  sort,
  order,
  searchAfter,
  limit,
}: DownloadAnnotationsArgs): Promise<any[]> {
  const params = {
    isAdminDownloader,
    sourceHypothesisGroup,
    sort,
    order,
    searchAfter,
    limit,
  }
  const { data } = await axiosClient.get<{ rows: any[] }>(
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

interface CopyAnnotationsArgs extends PostAnnotationArgs {
  sourceAnnotations: any[]
}
async function copyAnnotations({
  sourceAnnotations,
  datasetId,
  isAdminAuthor,
  destinationUrl,
  destinationHypothesisGroup,
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
    const batchOfNewAnnotations = newAnnotations.slice(
      exportOffset,
      exportOffset + REQUEST_BATCH_SIZE
    )
    const postData = {
      oldAnnotationIds: sourceAnnotations.map((ann) => ann.id),
      newAnnotations: batchOfNewAnnotations,
      isAdminAuthor,
      destinationUrl,
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
    exportedCount += data.total
  }
  return exportedCount
}

type CreateNewAnnotationKeys =
  | "destinationUrl"
  | "destinationHypothesisGroup"
  | "privateAnnotation"
  | "addQdrInfo"

interface CreateNewAnnotationArgs extends Pick<PostAnnotationArgs, CreateNewAnnotationKeys> {
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
}: CreateNewAnnotationArgs): any {
  sourceAnnotation.target.forEach((element: any) => {
    element.source = destinationUrl
  })
  let newReadPermission = sourceAnnotation.permissions.read
  if (!privateAnnotation) {
    newReadPermission = [`group:${destinationHypothesisGroup}`]
  }

  let newText = sourceAnnotation.text
  if (newAnnotationPrefixIndex && newAnnotationPrefixIndex > 0) {
    newText = `<b>AN${newAnnotationPrefixIndex}</b><br>${newText}`
  }
  if (addQdrInfo) {
    newText = `${ATI_HEADER_HTML}${newText}`
  }

  //consider typing this
  return {
    uri: destinationUrl,
    //document
    text: newText,
    tags: sourceAnnotation.tags,
    group: destinationHypothesisGroup,
    //other permission types default to the user only
    permissions: { read: newReadPermission },
    target: sourceAnnotation.target,
    //references
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
