import request from './request.js'

export const getAI=(question)=>{
	return request({
		method: 'POST',
		url: '/chat',
		data: {question},
	})
}
export const getAIStream=(question)=>{
	return request({
		method: 'post',
		url: '/wsChat',
		data: {question},
		responseType: 'stream',
	})
}
