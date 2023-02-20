<script setup>
import Chat from './Chat.vue'
import {useRouter} from 'vue-router'
const router=useRouter()
</script>

<template>
	<div class="home">
		<el-menu
			class="menu"
			background-color="#545c64"
			text-color="#fff"
			active-text-color="#ffd04b"
			default-active="1"
		>
			<el-menu-item index="1" @click="router.push('/chat')">
				<el-icon><ChatDotSquare /></el-icon>
				<span>对话</span>
			</el-menu-item>
			<el-menu-item index="2" disabled>
				<el-icon><Picture /></el-icon>
				<span>AI图片</span>
			</el-menu-item>
		</el-menu>
		<div class="component">
			<Chat />
		</div>
	</div>
</template>

<style scoped>
.home {
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 300px 1fr;
	width: 100%;
	height: 100%;
	place-content: center;
}
</style>
