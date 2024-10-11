<script setup lang="ts">
import { ref } from 'vue'
import { ChatContent } from '@/types/chat/ChatLog'
import ChatContentEntry from './ChatContentEntry.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { ChatMessage } from '@/types/chat/SearchChatRequest'

const props = defineProps<{
  entry: ChatContent
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
    <h4 class="lupa-chat-section-title" @click="entry.expanded = !entry.expanded">
      {{ entry.userInput }}
    </h4>
    <div v-if="entry.suggestedPhrases?.length" v-show="entry.expanded">
      <ChatContentEntry
        :entry="entry"
        :options="options"
        :history="history"
        @loaded="(items) => bestItemsLoaded(items, entry.key)"
      />
    </div>
  </div>
</template>
