<script setup>
import { getAIImage } from "./utils/api.js";
import { ref } from "vue";

const imageUrl = ref('')
const keyword = ref('')
const loading = ref(false)
const getImage = () => {
  if(!keyword.value) return
  loading.value = true
  getAIImage(keyword.value)
    .then((res)=>{
    imageUrl.value = res.data.url
  }).catch((err)=>{
    console.warn(err)
  }).finally(()=>{
    loading.value = false
  })
}
</script>

<template>
  <div class="ai-image">
    <div class="img-show">
      <el-image
        class="img"
        v-if="imageUrl"
        :src="imageUrl"
      >
        <template #placeholder>
          <div class="image-slot">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="image" class="ske"/>
              </template>
            </el-skeleton>
            <span>加载中</span>
          </div>
        </template>
      </el-image>
      <div v-else>请在右侧输入关键词生成图片</div>
    </div>
    <div class="img-keyword">
      <el-input v-model="keyword" @keydown.enter="getImage"/>
      <el-button
        @click="getImage"
        :loading="loading"
        :disabled="!keyword"
      >
        生成
      </el-button>
    </div>
  </div>
</template>

<style scoped>
 .ai-image {
   padding: 48px;
   width: 100%;
   height: 100vh;
   display: grid;
   grid-template-columns: 2fr 1fr;
   grid-column-gap: 48px;
 }


 .img {
   width: 80vh;
   height: 80vh;
 }

 @media only screen and (max-width: 480px) {
   .ai-image {
     grid-template-rows: 2fr 1fr;
     grid-template-columns: none;
   }
   .img {
     width: auto;
     height: auto;
   }
 }
 .img-show {
   border: 1px solid #7f7f7f;
   padding: 4px;
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
 }
 .image-slot {
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;

   :deep(.el-skeleton__image) {
     width: 100%;
   }
 }
 .img-keyword {
  display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   row-gap: 12px;
 }

 .ske {
   height: 70vh;
   width: 70vh;
 }
</style>