<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
// import config from '../config/index.js'

const loading=ref(false)
const ans=ref()
const isEnterDisabled=ref(false)

const question=ref('')
const answer=ref('')
const context=ref([])
const totalTokens=ref(0)

const questionArr=ref([])
const answerArr=ref([])

const contentArr=computed(()=>{
	const arr=[]
	questionArr.value.map((item,index)=>{
		arr.push(item)
		arr.push(answerArr.value[index])
		return item
	})
	return arr
})

const ws = new WebSocket(`ws://54.79.221.81:3000`)
ws.onopen = () => {
	console.log('opended')
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
				content: answer.value
			})
			loading.value = false
			isEnterDisabled.value=false
			nextTick(() => {
				Prism.highlightAll()
			})
			return
		}
		answer.value = answer.value + event.data
		answerArr.value[answerArr.value.length - 1] = answer.value
		
		nextTick(() => {
			Prism.highlightAll()
		})
	}
}
// const getOpenAI= async () => {
// 	if (!question.value) return
// 	isEnterDisabled.value = true
// 	questionArr.value.push(question.value)
// 	loading.value = true
// 	context.value.push({
// 		role: 'user',
// 		content: question.value
// 	})
// 	await nextTick(() => {
// 		ans.value.scrollTo({
// 			top: ans.value.scrollHeight,
// 			behavior: 'smooth'
// 		})
// 	})
// 	question.value=''
// 	getAI({
// 			model: "gpt-3.5-turbo",
// 			messages: context.value
// 		}
// 	).then(res => {
// 		console.log('111', res.data.choices[0].message.content)
// 		answer.value=res.data.choices[0].message.content
// 		answerArr.value.push(answer.value)
// 		context.value.push(res.data.choices[0].message)
// 		nextTick(()=>{
// 			ans.value.scrollTo({
// 				top: ans.value.scrollHeight,
// 				behavior: 'smooth'
// 			})
// 		})
// 	}).catch(e => {
// 		console.warn(e)
// 		answerArr.value.push('')
// 		context.value.push({content: '', role: 'assistant'})
// 		ElMessage({message: '请重试',type:'error'})
// 	}).finally(()=>{
// 		isEnterDisabled.value=false
// 		loading.value=false
// 	})
// }

const getAIFromStream = async () => {
	if (!question.value) return
	loading.value = true
	answer.value = ''
	isEnterDisabled.value = true
	questionArr.value.push(question.value)
	// loading.value = true
	context.value.push({
		role: 'user',
		content: question.value
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

const enterGetOpenAI=(e)=>{
	if(e.keyCode===13){
		e.preventDefault()
		if(!isEnterDisabled.value){
			getAIFromStream()
		}
	}
}

watch(()=>contentArr.value, (val)=>{
	nextTick(() => {
		ans.value.scrollTop = ans.value.scrollHeight;
	});
})

onUnmounted(()=>{
	ws.close()
})
</script>

<template>
	<div class="ask">
			<div
				class="top"
			>
				这里是GPT-3.5-turbo模型，请向我提问
			</div>
			<div
				class="answer scrollbar" ref="ans"
			>
				<div
					v-for="(item,index) in contentArr"
					:key="index"
					class="answer-item"
					:class="[index%2===0?'answer-right':'answer-left']"
				>
					<VueShowdown
						v-if="index%2!==0"
						:markdown="item"
						flavor="vanilla"
						:options="{ emoji: true }"
						tag="span"
					/>
					<span v-else>{{ item }}</span>
				</div>
			</div>
		<div class="question">
			<el-input
				autofocus
				type="textarea"
				resize="none"
				:autosize="{ minRows: 2, maxRows: 3 }"
				@keydown="enterGetOpenAI"
				v-model="question"
				class="input"
			/>
			<el-button
				@click="getAIFromStream"
				:loading="loading"
				style="height: 50px"
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
	align-items: center;
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
	justify-content: left;
	text-align: left;
}
.answer-right {
	justify-content: right;
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
