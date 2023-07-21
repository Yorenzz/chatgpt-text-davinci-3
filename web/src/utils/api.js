import request from './request.js'

export const getAIImage=(keyword)=>{
	return request({
		method: 'POST',
		url: '/image',
		data: {keyword},
	})
}

export const getRecorderTranslate = (file) => {
	console.log(file)
	return request({
		method: 'POST',
		url: '/recordTranslate',
		data: file,
		headers: {
			'Content-Type': 'multipart/form-data'
		},
	})
}