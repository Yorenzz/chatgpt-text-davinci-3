import request from './request.js'

export const getAIImage=(keyword)=>{
	return request({
		method: 'POST',
		url: '/image',
		data: {keyword},
	})
}
