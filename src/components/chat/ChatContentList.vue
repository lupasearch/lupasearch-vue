<script setup lang="ts">
import { ref } from 'vue'
import { ChatContent } from '@/types/chat/ChatLog'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { ChatMessage } from '@/types/chat/SearchChatRequest'
import ChatContentListEntry from './ChatContentListEntry.vue'

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
      <li v-for="entry of content" :key="entry.key" class="chat-content-list-entry">
        <ChatContentListEntry
          :entry="entry"
          :options="options"
          :history="history"
          @loaded="(items) => bestItemsLoaded(items, entry.key)"
        />
      </li>
    </ul>
  </div>
</template>
