const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.GPT_KEY || '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',
});
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

router.post('/chat', async (ctx, next) => {
  const { question } = ctx.request.body
  console.log(question)
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
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
    console.log('received', JSON.parse(message))
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: JSON.parse(message),
        stream: true
      }, { responseType: 'stream' })

      const stream = response.data

      stream.on('data', (chunk) => {
        // Messages in the event stream are separated by a pair of newline characters.
        const payloads = chunk.toString().split("\n\n")
        for (const payload of payloads) {
          if (payload.includes('[DONE]')) return;
          if (payload.startsWith("data:")) {
            const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
            try {
              const delta = JSON.parse(data.trim())
              console.log(delta.choices[0].delta?.content)
              ws.send('test reponse', delta.choices[0].delta?.content)
            } catch (error) {
              console.log(`Error with JSON.parse and ${ payload }.\n${ error }`)
            }
          }
        }
      })
      stream.on('end', () => console.log('Stream done'))
      stream.on('error', (e) => console.error(e))
    } catch (e) {
      console.warn(e)
    }
  })
})

// router.all('/sseChat', async (ctx)=>{
//   const { question } = ctx.request.body
//   ctx.status = 200
//   ctx.req.socket.setTimeout(10000)
//
//   const stream = sse(ctx.req, ctx.res)
//
//   const response = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: question.messages,
//     stream: true,
//   }, { responseType: 'stream' });
//
//
//
//   const gptStream = response.data
//
//   gptStream.on('data', (chunk) => {
//     // Messages in the event stream are separated by a pair of newline characters.
//     const payloads = chunk.toString().split("\n\n")
//     for (const payload of payloads) {
//       if (payload.includes('[DONE]')) return;
//       if (payload.startsWith("data:")) {
//         const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
//         try {
//           const delta = JSON.parse(data.trim())
//           console.log(delta.choices[0].delta?.content)
//           stream.sendEvent({
//             data: delta.choices[0].delta?.content,
//             event: 'message',
//             id: new Date().toISOString(),
//           });
//         } catch (error) {
//           console.log(`Error with JSON.parse and ${payload}.\n${error}`)
//         }
//       }
//     }
//   })
//   gptStream.on('end', () => console.log('Stream done'))
//   gptStream.on('error', (e) => console.error(e))
// })

// router.post('/chatStream', async (ctx, next) => {
//   const { question } = ctx.request.body
//   const response = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: question.messages,
//     stream: true,
//   }, { responseType: 'stream' });
//
//   const stream = response.data
//
//   stream.on('data', (chunk) => {
//     // Messages in the event stream are separated by a pair of newline characters.
//     const payloads = chunk.toString().split("\n\n")
//     for (const payload of payloads) {
//       if (payload.includes('[DONE]')) return;
//       if (payload.startsWith("data:")) {
//         const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
//         try {
//           const delta = JSON.parse(data.trim())
//           console.log(delta.choices[0].delta?.content)
//         } catch (error) {
//           console.log(`Error with JSON.parse and ${payload}.\n${error}`)
//         }
//       }
//     }
//   })
//   stream.on('end', () => console.log('Stream done'))
//   stream.on('error', (e) => console.error(e))
// })


module.exports = router
