const router = require('koa-router')()
const OpenAI = require('openai')
const { Readable } = require('stream')
// const configuration = new Configuration({
//   apiKey: process.env.GPT_KEY
// })
const webSocket = require('ws')
const { createReadStream, readFileSync, writeFileSync } = require('fs')
const { resolve, join } = require('path')

const ws = new webSocket.Server({
	port: 3000,
})
const openai = new OpenAI({
	apiKey: process.env.GPT_KEY,
})
router.get('/', async (ctx, next) => {
	await ctx.render('index', {
		title: 'Hello Koa 2!',
	})
})

router.get('/string', async (ctx, next) => {
	ctx.body = 'koa2 string'
})

router.post('/recordTranslate', async (ctx, next) => {
	// console.log(file)
	const fileObj = ctx.request.files.file // 获取上传文件
	console.log(fileObj)
	// file包含了文件名，文件类型，大小，路径等信息
	const res = await openai.createTranslation(
		fileObj, 'whisper-1',
	)
	console.log(res)
	ctx.body = res
})

router.post('/image', async (ctx, next) => {
	const { keyword } = ctx.request.body
	console.log(keyword)
	try {
		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt: keyword,
			n: 1,
			size: '1024x1024',
		})
		console.log(response.data)
		ctx.body = response.data[0]
	} catch (e) {
		console.warn(e)
	}
})

// router.post('/chat', async (ctx, next) => {
// 	const { question } = ctx.request.body
// 	console.log(question)
// 	try {
// 		const response = await openai.createChatCompletion({
// 			model: 'gpt-3.5-turbo-16k-0613',
// 			messages: question.messages,
// 			temperature: 0.7,
// 		})
// 		const res = response.data
// 		ctx.body = res
// 	} catch (err) {
// 		console.warn(err)
// 	}
// })

ws.on('connection', (ws) => {
	console.log('ws open')
	ws.on('message', async (message) => {
		ws.send('start')
		try {
			console.log(JSON.parse(message), 'question')
			const stream = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo-1106',
				messages: JSON.parse(message),
				stream: true,
				temperature: 0.7,
			})

			for await (const part of stream) {
				console.log(part.choices[0].delta?.content, 'answer')
				ws.send(part.choices[0].delta?.content)
			}
			ws.send('end')
		} catch (e) {
			console.warn(e)
			ws.send('error')
		}
	})
})

module.exports = router
