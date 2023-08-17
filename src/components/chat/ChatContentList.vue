<script setup lang="ts">
import { ChatContent } from '@/types/chat/ChatLog'
import ChatContentEntry from './ChatContentEntry.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { computed, ref } from 'vue'
import { Document } from '@getlupa/client-sdk/Types'
import ChatService from '@/chat/ChatService'
import { ChatMessage } from '@/types/chat/SearchChatRequest'

const props = defineProps<{
  content: ChatContent[]
  options: ChatOptions
  history?: ChatMessage[]
}>()

const emit = defineEmits(['loaded'])

const bestItemsLoaded = (items: string[], key: string) => {
  emit('loaded', { items, key })
}
</script>
<template>
  <div>
    <ul>
      <li v-for="entry of content" :key="entry.key">
        <h4 class="lupa-chat-section-title">{{ entry.userInput }}</h4>
        <ChatContentEntry
          :entry="entry"
          :options="options"
          :history="history"
          @loaded="(items) => bestItemsLoaded(items, entry.key)"
        />
      </li>
    </ul>
  </div>
</template>
