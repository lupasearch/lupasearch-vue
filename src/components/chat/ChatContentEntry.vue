<script setup lang="ts">
import { ChatContent } from '@/types/chat/ChatLog'
import ChatContentEntryPhrase from './ChatContentEntryPhrase.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { Ref, computed, ref } from 'vue'
import { Document } from '@getlupa/client-sdk/Types'
import ChatService from '@/chat/ChatService'
import ChatPhraseProductsList from './ChatPhraseProductsList.vue'
import { ChatMessage } from '@/types/chat/SearchChatRequest'
import ChatSpinner from './ChatSpinner.vue'

const props = defineProps<{
  entry: ChatContent
  options: ChatOptions
  history?: ChatMessage[]
}>()

const bestMatches: Ref<string[]> = ref([])
const loadedResults = ref([])
const loadedEntries = ref(0)
const loading = ref(true)

const emit = defineEmits(['loaded'])

const entryCount = computed(() => {
  return props.entry.allPhrases.length
})

const loaded = (results: Document[] = []) => {
  loadedResults.value.push(...results)
  loadedEntries.value++
  if (loadedEntries.value === entryCount.value) {
    loadFinalRecommendations()
  }
}

const titleKey = computed(() => {
  return props.options.displayOptions.titleKey ?? 'title'
})

const loadFinalRecommendations = async () => {
  try {
    const productResultStrings = loadedResults.value.map(
      (result) => result[titleKey.value]?.toString() ?? ''
    ) as string[]
    const { products } = await ChatService.suggestBestProductMatches(
      props.options.sdkOptions,
      {
        initialQuery: props.entry.userInput,
        productStrings: productResultStrings,
        messageHistory: props.history ?? []
      },
      props.options.chatSettings
    )
    bestMatches.value = products
    emit('loaded', products)
  } finally {
    loading.value = false
  }
}

const bestMatchProducts = computed(() => {
  return bestMatches.value
    .map((productName) => {
      return loadedResults.value.find((r) => r[titleKey.value] === productName)
    })
    .filter(Boolean)
})

const explanation = computed(() => {
  return bestMatches.value?.length > 0 && !bestMatchProducts.value.length
    ? bestMatches?.value?.[0]
    : ''
})
</script>
<template>
  <div>
    <ul>
      <li v-for="phrase of entry.allPhrases" :key="phrase" class="lupa-chat-content-entry">
        <ChatContentEntryPhrase
          v-if="phrase"
          :phrase="phrase"
          :options="options"
          @loaded="loaded"
        />
      </li>
    </ul>
    <section class="lupa-chat-best-matches lupa-chat-content-entry">
      <h3>Best matches</h3>
      <p v-if="explanation">{{ explanation }}</p>
      <ChatSpinner
        v-if="loading"
        message="Selecting the best matches for you. This might take a few seconds."
      />
      <ChatPhraseProductsList
        v-if="bestMatches.length"
        :search-results="bestMatchProducts"
        :options="options.displayOptions"
      />
    </section>
  </div>
</template>
