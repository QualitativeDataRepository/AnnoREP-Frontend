import axios from "axios"
import axiosRetry from "axios-retry"

const HYPOTHESIS_API_BASE_URL = process.env.HYPOTHESIS_SERVER_URL || "https://api.hypothes.is"

const axiosClient = axios.create()
axiosRetry(axiosClient, {
  retries: 5,
  retryDelay: (retryCount, error) => {
    if (error.response) {
      const retryAfter = error.response.headers["retry-after"]
      if (retryAfter) {
        return retryAfter
      }
      if (error.response.status === 429 && error.config.url?.includes(HYPOTHESIS_API_BASE_URL)) {
        return retryCount * 1000 /** ms */
      }
    }
    return axiosRetry.exponentialDelay(retryCount)
  },
  retryCondition: (e) => {
    if (e.response) {
      if (e.response.status === 429 && e.response.config.url?.includes(HYPOTHESIS_API_BASE_URL)) {
        return true
      }
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(e)
  },
})

export { axiosClient }
