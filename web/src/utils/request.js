import axios from 'axios'
import config from '../config/index.js'

const service = axios.create({
	baseURL: config.baseApi,
	timeout: 24000,
})

const request = options => {
	options.method = options.method || 'get'
	return service(options)
}

const service2=axios.create()
service2.interceptors.request.use(req => {
	const headers = req.headers
	if (!headers.Authorization) { headers.Authorization = `Bearer ` }
	return req
})
export const ser=option=>service2(option)

export default request

