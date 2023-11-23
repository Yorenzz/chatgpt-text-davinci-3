<script setup>
import Recorder from 'js-audio-recorder'
import {ElMessage} from "element-plus";
import { ref } from "vue";
import {getRecorderTranslate} from "./utils/api.js";

const recorder = ref(new Recorder())
const timer = ref(null)
const playTime = ref(0)
const handleStart = () => {
  Recorder.getPermission().then(() => {
    console.log('开始录音')
    recorder.value.start() // 开始录音
  }, (error) => {
    ElMessage({
      message: '请先允许该网页使用麦克风',
      type: 'info'
    })
    console.log(`${error.name} : ${error.message}`)
  })
}
const handlePause = () => {
  console.log('暂停录音')
  recorder.value.pause() // 暂停录音
}
const handleResume = () => {
  console.log('恢复录音')
  recorder.value.resume() // 恢复录音
}
const handleStop = () => {
  console.log('停止录音')
  recorder.value.stop() // 停止录音
}
const handlePlay = () => {
  console.log('播放录音')
  console.log(recorder.value)
  recorder.value.play() // 播放录音

  // 播放时长
  timer.value = setInterval(() => {
    try {
      playTime.value = recorder.value.getPlayTime()
    } catch (error) {
      timer.value = null
    }
  }, 100)
}
const handlePausePlay = () => {
  console.log('暂停播放')
  recorder.value.pausePlay() // 暂停播放

  // 播放时长
  playTime.value = recorder.value.getPlayTime()
  timer.value = null
}
const handleResumePlay = () => {
  console.log('恢复播放')
  recorder.value.resumePlay() // 恢复播放

  // 播放时长
  timer.value = setInterval(() => {
    try {
      playTime.value = recorder.value.getPlayTime()
    } catch (error) {
      timer.value = null
    }
  }, 100)
}
const handleStopPlay = () => {
  console.log('停止播放')
  recorder.value.stopPlay() // 停止播放

  // 播放时长
  playTime.value = recorder.value.getPlayTime()
  timer.value = null
}
const handleDestroy = () => {
  console.log('销毁实例')
  recorder.value.destroy() // 毁实例
  timer.value = null
}
const uploadRecord = () => {
  if (recorder.value == null || recorder.value.duration === 0) {
    ElMessage.warning({
      message: '请先录音',
      type: 'error'
    })
    return false
  }
  recorder.value.pause() // 暂停录音
  // timer.value = null
  console.log('上传录音')// 上传录音

  const formData = new FormData()
  const blob = recorder.value.getWAVBlob()// 获取wav格式音频数据
  console.log(blob)
  // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
  const newBlob = new Blob([blob], { type: 'audio/wav' })
  const fileOfBlob = new File([newBlob], new Date().getTime() + '.wav')
  formData.append('file', fileOfBlob)
  getRecorderTranslate(formData).then(res=>{
    console.log(res.data)
  }).catch(err=>{
    console.warn(err)
  })
  const url = window.URL.createObjectURL(fileOfBlob)
  console.log(url)
}
</script>

<template>
  <div class="record">
    <h3>录音时长：{{ recorder && recorder.duration.toFixed(4) }}</h3>
    <br>
    <br>
    <el-button @click="handleStart">开始录音</el-button>
    <el-button type="info" @click="handlePause">暂停录音</el-button>
    <el-button type="success" @click="handleResume">继续录音</el-button>
    <el-button type="warning" @click="handleStop">停止录音</el-button>
    <br>
    <br>
    <h3>
      播放时长：{{
        recorder &&
        (playTime > recorder.duration
          ? recorder.duration.toFixed(4)
          : playTime.toFixed(4))
      }}
    </h3>
    <br>
    <br>

    <el-button type="primary" @click="handlePlay">播放录音</el-button>
    <el-button type="info" @click="handlePausePlay">暂停播放</el-button>
    <el-button type="success" @click="handleResumePlay">继续播放</el-button>
    <el-button type="warning" @click="handleStopPlay">停止播放</el-button>
    <el-button type="danger" @click="handleDestroy">销毁录音</el-button>
    <el-button type="primary" @click="uploadRecord">上传</el-button>
  </div>
</template>

<style scoped>
.record {
  width: 100%;
  height: 100vh;
}
</style>