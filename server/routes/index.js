const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.GPT_KEY || '',
});
console.log(process.GPT_KEY)
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

  try {
    const res = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      messages: question.messages,
      temperature: 0.7,
      stream: true,
    }, { responseType: 'stream' });

    res.data.on('data', data => {
      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          return; // Stream finished
        }
        try {
          const parsed = JSON.parse(message);
          console.log(parsed.choices[0].text);
        } catch(error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    });
  } catch (error) {
    if (error.response?.status) {
      console.error(error.response.status, error.message);
      error.response.data.on('data', data => {
        const message = data.toString();
        try {
          const parsed = JSON.parse(message);
          console.error('An error occurred during OpenAI request: ', parsed);
        } catch(error) {
          console.error('An error occurred during OpenAI request: ', message);
        }
      });
    } else {
      console.error('An error occurred during OpenAI request', error);
    }
  }
})


module.exports = router
