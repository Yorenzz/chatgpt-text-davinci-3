import request, { ser } from './request.js'

export const getAI=(question)=>{
	return request({
		method: 'POST',
		url: '/chat',
		data: {question},
	})
}
export const getAI2=(question)=>{
	return ser({
		method: 'POST',
		url: 'https://api.openai.com/v1/chat/completions',
		data: question,
	})
}
