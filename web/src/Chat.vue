<script setup>
import { computed, nextTick, ref } from 'vue'
import axios from 'axios'
import config from './config/index.js'
import { getAI } from './utils/api.js'

const loading=ref(false)
const ans=ref()
const isEnterDisabled=ref(false)

const question=ref('')
const answer=ref('')
const context=ref('')
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

const GetOpenAI= async () => {
	if(!question.value) return
	isEnterDisabled.value=true
	questionArr.value.push(question.value)
	loading.value=true
	context.value+=`Human:${ question.value }\nAI:`
	console.log(context.value)
	await nextTick(() => {
		ans.value.scrollTo({
			top: ans.value.scrollHeight,
			behavior: 'smooth'
		})
	})
	question.value=''
	getAI(context.value).then(res=>{
		answer.value=res.data.choices[0].text
		totalTokens.value=res.data.usage.total_tokens
		answerArr.value.push(answer.value)
		context.value+=`${ answer.value }\n`
		nextTick(()=>{
			ans.value.scrollTo({
				top: ans.value.scrollHeight,
				behavior: 'smooth'
			})
		})
	}).catch((err)=>{
		console.warn(err.response.data)
		questionArr.value.pop()
		context.value=context.value.slice(5)
		context.value=context.value.slice(context.value.indexOf('Human:'))
		context.value=context.value.slice(0,context.value.lastIndexOf('Human:'))
		GetOpenAI()
	}).finally(()=>{
		isEnterDisabled.value=false
		loading.value=false
	})
}

const enterGetOpenAI=(e)=>{
	if(e.keyCode===13){
		e.preventDefault()
		if(!isEnterDisabled.value){
			GetOpenAI()
		}
	}
}
</script>

<template>
	<div class="ask">
			<div
				class="top"
			>
				这里是ChatGPT-text-davinci-003模型，请向我提问
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
				style="width: 700px;height: 50px;margin-right: 12px;"
			/>
			<el-button
				@click="GetOpenAI"
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
	padding: 16px 150px;
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
</style>
