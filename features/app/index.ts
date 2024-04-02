import axios from "axios"
import axiosRetry from "axios-retry"
import { isSameHostName } from "../../utils/httpRequestUtils"

const HYPOTHESIS_API_BASE_URL = process.env.HYPOTHESIS_SERVER_URL || "https://api.hypothes.is"

const axiosClient = axios.create()
axiosRetry(axiosClient, {
  retries: 5,
  retryDelay: (retryCount, error) => {
    if (error.response) {
      const retryAfter = error.response.headers["retry-after"]
      if (retryAfter) {
        const retryAfterSeconds = parseInt(retryAfter.trim(), 10)
        if (!isNaN(retryAfterSeconds)) {
          return retryAfterSeconds * 1000
        }
        const retryAfterDate = Date.parse(retryAfter.trim())
        if (!isNaN(retryAfterDate)) {
          const currentTime = Date.now()
          const delay = Math.max(retryAfterDate - currentTime, 0)
          return delay
        }
      }
      if (error.response.status === 429 && error.config?.url) {
        const isHypothesisUrl = isSameHostName(error.config.url, HYPOTHESIS_API_BASE_URL)
        if (isHypothesisUrl) {
          return retryCount * 2000 /** ms */
        }
      }
    }
    return axiosRetry.exponentialDelay(retryCount)
  },
  retryCondition: (e) => {
    if (e.response) {
      if (e.response.status === 429 && e.response.config.url) {
        const isHypothesisUrl = isSameHostName(e.response.config.url, HYPOTHESIS_API_BASE_URL)
        if (isHypothesisUrl) {
          return true
        }
      }
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(e)
  },
})

export { axiosClient }
