<script setup lang="ts">
import lupaSearchSdk from '@getlupa/client-sdk'
import ChatService from '@/chat/ChatService'
import { ChatOptions } from '@/types/chat/ChatOptions'
import { Ref, computed, onMounted, ref } from 'vue'
import { Document, PublicQuery } from '@getlupa/client-sdk/Types'
import ChatPhraseProductsList from './ChatPhraseProductsList.vue'
import ChatSpinner from './ChatSpinner.vue'

const props = defineProps<{
  options: ChatOptions
  phrase: string
}>()

const searchResults: Ref<Document[]> = ref([])
const usedAlternativePhrases: Ref<string[]> = ref([])
const usedPartialResults: Ref<boolean> = ref(false)
const loading = ref(false)

const emit = defineEmits(['loaded'])
const currentAction = ref('')

const displayPhrase = computed(() => props.phrase.replace(',', ''))

onMounted(async () => {
  loading.value = true
  currentAction.value = 'Loading search results...'
  try {
    const initialResults = await getSearchResults(props.phrase, 8)
    if (initialResults.length) {
      searchResults.value = initialResults
      if (initialResults.length > 2) {
        return
      }
    }
    currentAction.value = 'Checking for alternative phrases...'

    const alternatives = await getPhraseAlternatives()
    await addAlternativePhraseResults(alternatives, 6)
    if (!searchResults.value.length) {
      const partialAlteratives = [props.phrase].map((phrase) => phrase.split(/\s+/)).flat()
      currentAction.value = 'Checking for partial alternatives...'
      const partialResults = await addAlternativePhraseResults(partialAlteratives, 4)
      if (partialResults?.length) {
        usedPartialResults.value = true
      }
    }
  } finally {
    loading.value = false
    currentAction.value = ''
    emit('loaded', searchResults.value)
  }
})

const addAlternativePhraseResults = async (phrases: string[], limit = 5) => {
  const allResults = []
  for (const phrase of phrases) {
    const results = await getSearchResults(phrase, limit)
    if (results.length) {
      usedAlternativePhrases.value.push(phrase)
      addToSearchResults(results)
      allResults.push(...results)
    }
  }
  return allResults
}

const addToSearchResults = (items: Document[]) => {
  const newDocuments = items.filter((item) => {
    return !searchResults.value.find((result) => result.id === item.id)
  })
  searchResults.value.push(...newDocuments)
}

const getSearchResults = async (phrase: string, limit = 5) => {
  const query: PublicQuery = { searchText: phrase, limit }
  const result = await lupaSearchSdk.query(
    props.options.displayOptions.queryKey,
    query,
    props.options.sdkOptions
  )
  if (!result.success) {
    return []
  }
  return result.items
}

const getPhraseAlternatives = async () => {
  const { phrases } = await ChatService.suggestPhraseAlternatives(
    props.options.sdkOptions,
    {
      phrases: [props.phrase],
      queryKey: props.options.displayOptions.queryKey
    },
    props.options.chatSettings
  )
  return phrases ?? []
}
</script>
<template>
  <div class="lupa-chat-content-entry-phrase">
    <div class="lupa-chat-phrase-title">
      <h3>{{ displayPhrase }}</h3>
      <sub>{{ usedAlternativePhrases.join(', ') }}</sub>
      <sub v-if="usedPartialResults" class="alert"
        >Including partial matches - which might not be what you are looking for</sub
      >
    </div>
    <div>
      <ChatPhraseProductsList :search-results="searchResults" :options="options.displayOptions" />
    </div>
    <div v-if="!loading && !searchResults.length" class="lupa-chat-no-results">
      <p>We found no matches for this search term</p>
    </div>
    <ChatSpinner v-if="loading" :message="currentAction" />
  </div>
</template>
