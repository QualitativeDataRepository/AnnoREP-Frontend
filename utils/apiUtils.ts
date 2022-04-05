import { AxiosPromise } from "axios"

import { axiosClient } from "../features/app"

export type GetApiResponse = () => AxiosPromise<any>

export const deleteFile =
  (fileId: string): GetApiResponse =>
  () => {
    return axiosClient.delete(`/api/delete-file/${fileId}`)
  }
