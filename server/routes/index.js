const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.GPT_KEY
})
const webSocket = require('ws')

const ws = new webSocket.Server({port: 3000})
const openai = new OpenAIApi(configuration)
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.post('/recordTranslate', async (ctx, next) => {
  const { file } = ctx.request
  console.log(file)
  ctx.body = 'success'
})

router.post('/image', async (ctx, next)=>{
  const { keyword } = ctx.request.body
  console.log(keyword)
  try {
    const response = await openai.createImage({
      prompt: keyword,
      n: 1,
      size: "1024x1024",
    })
    console.log(response.data)
    ctx.body = response.data.data[0]
  } catch (e) {
    console.warn(e)
  }
})

router.post('/chat', async (ctx, next) => {
  const { question } = ctx.request.body
  console.log(question)
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      messages: question.messages,
      temperature: 0.7,
    })
    const res=response.data
    ctx.body = res
  } catch (err){
    console.warn(err)
  }
})

ws.on('connection', (ws)=> {
  console.log('ws open')
  ws.on('message', async (message) => {
    ws.send('start')
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: JSON.parse(message),
        stream: true,
        temperature: 0.7,
      }, { responseType: 'stream' })

      const stream = response.data

      stream.on('data', (chunk) => {
        const payloads = chunk.toString().split("\n\n")
        for (const payload of payloads) {
          if (payload.includes('[DONE]')) return;
          if (payload.startsWith("data:")) {
            const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
            try {
              const delta = JSON.parse(data.trim())
              console.log(delta.choices[0].delta?.content)
              ws.send(delta.choices[0].delta?.content)
            } catch (error) {
              console.warn(`Error with JSON.parse and ${ payload }.\n${ error }`)
            }
          }
        }
      })
      stream.on('end', () => {
        console.log('Stream done')
        ws.send('end')
      })
      stream.on('error', (e) => console.error(e))
    } catch (e) {
      console.warn(e)
    }
  })
})


module.exports = router
