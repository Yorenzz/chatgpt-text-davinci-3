<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { marked } from 'marked'
import { escape } from 'lodash'
import { markedHighlight } from 'marked-highlight'
import { ElMessage } from 'element-plus'

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	mangle: false,
	breaks: true,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	headerIds: false,
})
marked.use(markedHighlight({
	langPrefix: 'line-numbers language-',
	highlight (code, lang) {
	},
}))

const loading = ref(false)
const ans = ref()
const isEnterDisabled = ref(false)

const question = ref('')
const answer = ref('')
const context = ref([])
const totalTokens = ref(0)

const questionArr = ref([])
const answerArr = ref([])

const contentArr = computed(() => {
	const arr = []
	questionArr.value.map((item, index) => {
		arr.push(escape(item || ''))
		arr.push(marked.parse(escape(answerArr.value[index] || '')))
		return item
	})
	return arr
})

const ws = new WebSocket('ws://54.79.221.81:3000')
ws.onopen = () => {
	console.log('opended')
}
ws.onerror = (err) => {
	console.log(err, '链接失败')
	ElMessage.error('连接失败，请刷新网页重试')
}
ws.onmessage = async (event) => {
	if (event.data === 'start') {
		answerArr.value.push(answer.value)
	} else {
		if (event.data instanceof Blob) {
			return
		}
		if (event.data === 'end') {
			context.value.push({
				role: 'assistant',
				content: answer.value,
			})
			loading.value = false
			isEnterDisabled.value = false
			return
		}
		if (event.data === 'error') {
			loading.value = false
			isEnterDisabled.value = false
			ElMessage.error('oops，出了点问题，请刷新页面或稍后重试')
			return
		}
		answer.value = answer.value + event.data
		answerArr.value[answerArr.value.length - 1] = answer.value
	}
	nextTick(() => {
		Prism.highlightAll()
	})
}

const getAIFromStream = async () => {
	if (!question.value) return
	loading.value = true
	answer.value = ''
	isEnterDisabled.value = true
	questionArr.value.push(question.value)
	// loading.value = true
	context.value.push({
		role: 'user',
		content: question.value,
	})
	await nextTick(() => {
		ans.value.scrollTop = ans.value.scrollHeight
	})

	question.value = ''
	const handleSend = () => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(context.value))
		} else {
			// Queue a retry
			setTimeout(() => { handleSend() }, 1000)
		}
	}
	handleSend()
}

const enterGetOpenAI = (e) => {
	if (e.keyCode === 13) {
		e.preventDefault()
		if (!isEnterDisabled.value) {
			getAIFromStream()
		}
	}
}

watch(() => contentArr.value, (val) => {
	nextTick(() => {
		ans.value.scrollTop = ans.value.scrollHeight
	})
})

onUnmounted(() => {
	ws.close()
})
</script>

<template>
  <div class="ask">
    <div
      class="top"
    >
      使用GPT-3.5-turbo-16k-0613模型
    </div>
    <div
      ref="ans"
      class="answer scrollbar"
    >
      <div
        v-for="(item,index) in contentArr"
        :key="index"
        class="answer-item"
        :class="[index%2===0?'answer-right':'answer-left']"
        v-html="item"
      />
    </div>
    <div class="question">
      <el-input
        v-model="question"
        autofocus
        type="textarea"
        resize="none"
        :autosize="{ minRows: 2, maxRows: 3 }"
        class="input"
        @keydown="enterGetOpenAI"
      />
      <el-button
        :loading="loading"
        style="height: 50px"
        @click="getAIFromStream"
      >
        提问
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.ask {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	height: 100%;
}
.question {
	width: 100%;
	min-height: 100px;
	height: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #eee;
}
.answer {
	width: 100%;
	display: flex;
	flex-direction: column;
	white-space: pre-wrap;
	height: calc(100vh - 155px);
	overflow: auto;
}
.answer-item {
	padding: 16px 150px;
	display: flex;
  flex-direction: column;
	justify-content: center;
	height: auto;
	border: #eee 1px solid;
	white-space: pre-wrap;
}
.top{
	padding: 16px;
	display: flex;
	align-items: center;
	height: auto;
	justify-content: center;
	width: 100%;
	background: #cbc6c6;
}
.answer-item:nth-child(2n+1){
	background: #F2F2F2;
}

.scrollbar::-webkit-scrollbar {
	width: 5px;
	background-color: #f1f1f1;
	border-radius: 10px;
}

.input {
	width: 700px;
	height: 50px;
	margin-right: 12px;
}

.scrollbar::-webkit-scrollbar-thumb {
	background-color: #7f7f7f;
	border-radius: 10px;
}

.scrollbar::-webkit-scrollbar-track {
	background-color: #f1f1f1;
	border-radius: 10px;
}
.answer-left {
	align-items: flex-start;
	text-align: left;
}
.answer-right {
	align-items: flex-end;
	text-align: right;
}
@media only screen and (max-width: 1228px) {
	.answer-item {
		padding: 16px 16px;
	}
	.input {
		width: 70%;
	}
}
</style>
