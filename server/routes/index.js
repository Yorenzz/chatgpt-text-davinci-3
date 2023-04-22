const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '',
});

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
  const openai = new OpenAIApi(configuration)
  console.log(question)
  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      message: `${question}`,
      max_tokens: 4096,
      temperature: 0.7,
    })
    const res=response.data
    ctx.body = res
  } catch (err){
    console.warn(err)
  }
})

module.exports = router
