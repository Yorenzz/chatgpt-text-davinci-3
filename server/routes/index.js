const router = require('koa-router')()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '',
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
  ctx.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
  console.log(question)
  try {
    const stream = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: question.messages,
      temperature: 0.7,
      stream: true,
    }, {
      responseType: 'stream'
    })
    console.log(stream)

    stream.data.on('data', (response) => {
        ctx.res.write(`data: ${JSON.stringify(response)}\n\n`)
    })

    stream.data.on('close', () => {
        ctx.res.end()
    })
  } catch (err){
    console.warn(err)
  }
})


// name: 'StreamingExample',
//     data() {
//   return {
//     openaiApiKey: 'YOUR_API_KEY',
//     apiUrl: 'https://api.openai.com/v1/engines/davinci/completions',
//     requestOptions: {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${this.openaiApiKey}`,
//       },
//       responseType: 'stream',
//     },
//     requestData: {
//       model: 'text-davinci-002',
//       prompt: 'Hello,',
//       temperature: 0.5,
//     },
//     responseData: '',
//     streamSource: null,
//   };
// },
// methods: {
//   startStreaming() {
//     this.streamSource = axios.post(this.apiUrl, this.requestData, this.requestOptions);
//     this.streamSource.data.on('data', (chunk) => {
//       this.responseData += chunk;
//     });
//   },
//   stopStreaming() {
//     if (this.streamSource) {
//       this.streamSource.cancel();
//       this.streamSource = null;
//     }
//   },
// },
// };

module.exports = router
