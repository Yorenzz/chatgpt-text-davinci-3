<script setup>
import { useRouter } from 'vue-router'
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
			<el-menu-item index="2" @click="router.push('/image')">
				<el-icon><Picture /></el-icon>
				<span>AI图片</span>
			</el-menu-item>
			<el-menu-item index="3" @click="router.push('/record')">
        <el-icon><Mic /></el-icon>
				<span>AI录音翻译</span>
			</el-menu-item>
		</el-menu>
		<el-menu
			class="menu-horizontal"
			background-color="#545c64"
			text-color="#fff"
      mode="horizontal"
			active-text-color="#ffd04b"
			default-active="1"
		>
			<el-menu-item index="1" @click="router.push('/chat')">
				<el-icon><ChatDotSquare /></el-icon>
				<span>对话</span>
			</el-menu-item>
			<el-menu-item index="2" @click="router.push('/image')">
				<el-icon><Picture /></el-icon>
				<span>AI图片</span>
			</el-menu-item>
		</el-menu>
		<div class="component">
			<router-view />
		</div>
	</div>
</template>

<style scoped>
.home {
	display: grid;
	grid-template-columns: 200px 1fr;
	width: 100%;
	height: 100%;
}
.menu-horizontal {
  display: none;
}
 @media only screen and (max-width: 480px) {
	 .menu {
		 display: none;
	 }
   .menu-horizontal {
     display: flex;
   }
	 .home {
		 display: flex;
     flex-direction: column;
		 width: 100%;
		 height: 100%;
	 }
 }
.component {
	width: 100%;
}
</style>
