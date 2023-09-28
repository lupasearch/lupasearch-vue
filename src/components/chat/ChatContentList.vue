<script setup lang="ts">
import { ChatContent } from '@/types/chat/ChatLog'
import ChatContentEntry from './ChatContentEntry.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { ChatMessage } from '@/types/chat/SearchChatRequest'
import ChatTextEntry from './ChatTextEntry.vue'

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
        <ChatTextEntry :content="entry.userInput" :history="history" :options="options" />
        <ChatContentEntry
          v-if="entry.suggestedPhrases?.length"
          :entry="entry"
          :options="options"
          :history="history"
          @loaded="(items) => bestItemsLoaded(items, entry.key)"
        />
      </li>
    </ul>
  </div>
</template>
