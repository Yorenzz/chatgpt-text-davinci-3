import axios from 'axios'
import config from '../config/index.js'

const service = axios.create({
	baseURL: config.baseApi,
	timeout: 12000,
})

const request = options => {
	options.method = options.method || 'get'
	return service(options)
}

export default request
