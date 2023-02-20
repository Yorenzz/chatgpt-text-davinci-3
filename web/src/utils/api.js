import request from './request.js'

export const getAI=(question)=>{
	return request({
		method: 'POST',
		url: '/chat',
		data: {question},
	})
}
