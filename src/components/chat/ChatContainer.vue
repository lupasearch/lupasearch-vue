<script setup lang="ts">
import { Ref, computed, ref } from 'vue'
import ChatInput from './ChatInput.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'
import ChatService from '@/chat/ChatService'
import { SearchChatRequest } from '@/types/chat/SearchChatRequest'
import { ChatContent } from '@/types/chat/ChatLog'
import ChatContentList from './ChatContentList.vue'
import Spinner from '../common/Spinner.vue'
import ChatSpinner from './ChatSpinner.vue'

const loading = ref(false)
const error = ref('')

const chatContent: Ref<ChatContent[]> = ref([])

const props = defineProps<{
  options: ChatOptions
}>()

const history = computed(() => ChatService.prepareChatHistory(chatContent.value))

const submitChatInput = async (input: string) => {
  if (input.length < 3) {
    return
  }
  try {
    loading.value = true
    const key = Date.now().toString()
    let chatLog: ChatContent = {
      key,
      userInput: input,
      allPhrases: [],
      suggestedPhrases: []
    }
    chatContent.value.push(chatLog)
    const request: SearchChatRequest = {
      userPrompt: input,
      messageHistory: history.value ?? [],
      queryKey: props.options.displayOptions.queryKey
    }
    const { phrases, success } = await ChatService.suggestSearchChatPhrases(
      props.options.sdkOptions,
      request
    )
    if (!success || !phrases.length) {
      error.value = 'Something went wrong'
      return
    }
    const validPhrases = phrases.filter((p) => p?.trim().length > 0)
    chatContent.value = chatContent.value.map((c) =>
      c.key === key
        ? {
            ...c,
            allPhrases: [...validPhrases],
            suggestedPhrases: phrases
          }
        : c
    )
  } finally {
    loading.value = false
  }
}

const bestItemsLoaded = ({ items, key }: { items: string[]; key: string }) => {
  const entry = chatContent.value.find((c) => c.key === key)
  entry.bestItems = items
}
</script>
<template>
  <section class="lupasearch-chat">
    <section class="lupa-chat-logo">
      <img src="https://www.lupasearch.com/images/partials/header/lupasearch-logo.svg" />
    </section>
    <section v-if="chatContent.length" class="lupasearch-chat-content">
      <ChatContentList
        :content="chatContent"
        :options="options"
        @loaded="bestItemsLoaded"
        :history="history"
      />
    </section>
    <section class="lupa-chat-spinner-main" v-if="loading">
      <ChatSpinner message="Loading initial recommendations... This might take up to 20s" />
    </section>
    <section class="lupasearch-chat-input">
      <ChatInput @submit="submitChatInput" :disabled="loading" />
    </section>
  </section>
</template>
