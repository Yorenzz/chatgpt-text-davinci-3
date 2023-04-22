<script setup>
import { computed, nextTick, ref } from 'vue'
import { getAI, getAI2 } from './utils/api.js'
import { ElMessage } from 'element-plus'

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

const getOpenAI= async () => {
	if (!question.value) return
	isEnterDisabled.value = true
	questionArr.value.push(question.value)
	loading.value = true
	context.value.push({
		role: 'user',
		content: question.value
	})
	await nextTick(() => {
		ans.value.scrollTo({
			top: ans.value.scrollHeight,
			behavior: 'smooth'
		})
	})
	question.value=''
	getAI({
			model: "gpt-3.5-turbo",
			messages: context.value
		}
	).then(res => {
		console.log('111', res.data.choices[0].message.content)
		answer.value=res.data.choices[0].message.content
		answerArr.value.push(answer.value)
		context.value.push(res.data.choices[0].message)
		nextTick(()=>{
			ans.value.scrollTo({
				top: ans.value.scrollHeight,
				behavior: 'smooth'
			})
		})
	}).catch(e => {
		console.warn(e)
		context.value?.shift()
		context.value?.shift()
		ElMessage({message: '请重试',type:'error'})
	}).finally(()=>{
		isEnterDisabled.value=false
		loading.value=false
	})
}

const enterGetOpenAI=(e)=>{
	if(e.keyCode===13){
		e.preventDefault()
		if(!isEnterDisabled.value){
			getOpenAI()
		}
	}
}
</script>

<template>
	<div class="ask">
			<div
				class="top"
			>
				这里是ChatGPT-gpt-3.5-turbo模型，请向我提问
			</div>
			<div
				class="answer scrollbar" ref="ans"
			>
				<div
					v-for="(item,index) in contentArr"
					:key="index"
					class="answer-item"
					:class="[index%2===0?'answer-left':'answer-right']"
				>
					{{ item }}
				</div>
			</div>
		<div class="question">
			<el-input
				type="textarea"
				resize="none"
				@keydown="enterGetOpenAI"
				v-model="question"
				class="input"
			/>
			<el-button
				@click="getOpenAI"
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
	height: 100px;
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
}
.answer-right {
	justify-content: right;
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
