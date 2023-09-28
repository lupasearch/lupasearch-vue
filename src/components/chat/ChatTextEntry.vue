<script setup lang="ts">
import ChatService from '@/chat/ChatService'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { ChatMessage } from '@/types/chat/SearchChatRequest'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  content: string
  options: ChatOptions
  history?: ChatMessage[]
}>()

const content = ref('')

const processChunk = (chunk: string) => {
  content.value += chunk
}

onMounted(() => {
  ChatService.getTextResponseChunkStream(
    props.options.sdkOptions,
    {
      initialQuery: props.content,
      messageHistory: props.history ?? []
    },
    processChunk
  )
})
</script>
<template>
  <div class="lupa-chat-text-response">
    <p v-html="content">
    </p>
  </div>
</template>
