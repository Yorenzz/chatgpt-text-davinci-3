const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.GPT_KEY || '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',
});
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

router.post('/chatStream', async (ctx, next) => {
  const { question } = ctx.request.body
  // try {
  //   const stream = await openai.createChatCompletion({
  //     model: "gpt-3.5-turbo",
  //     messages: question.messages,
  //     temperature: 0.7,
  //     stream: true,
  //   }, {
  //     responseType: 'stream'
  //   })
  //   ctx.set({
  //     'Content-Type': 'text/plain',
  //     'Transfer-Encoding': 'chunked'
  //   })
  //   ctx.body = stream
  // } catch (err){
  //   console.warn(err)
  // }
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: question.messages,
    stream: true,
  }, { responseType: 'stream' });

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
        } catch (error) {
          console.log(`Error with JSON.parse and ${payload}.\n${error}`)
        }
      }
    }
  })
  stream.on('end', () => console.log('Stream done'))
  stream.on('error', (e) => console.error(e))
})


module.exports = router
