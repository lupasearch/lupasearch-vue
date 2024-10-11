<script lang="ts" setup>
import { ref } from 'vue'
import ChatSpinner from './ChatSpinner.vue'
import { ChatOptions } from '@/types/chat/ChatOptions'

defineProps<{
  disabled?: boolean
  options: ChatOptions
}>()

const inputValue = ref('')
const emit = defineEmits(['submit', 'focus', 'blur', 'clear'])

const submit = () => {
  emit('submit', inputValue.value)
  inputValue.value = ''
}
</script>
<template>
  <div class="lupa-chat-input-container">
    <form action="javascript:void(0);" class="chat-input-form" @submit="submit">
      <div id="lupa-search-box-input">
        <input
          v-model="inputValue"
          ref="mainInput"
          autocomplete="off"
          class="lupa-search-box-input-field"
          data-cy="lupa-search-box-input-field"
          type="text"
          placeholder="Type your request here..."
          @focus="emit('focus')"
          @blur="emit('blur')"
        />
      </div>
      <template v-if="!disabled">
        <button class="lupa-chat-form-submit">
          {{ options?.chatSettings?.labels?.ask || 'Ask LupaChat' }}
        </button>
        <button v-if="!disabled" type="button" class="lupa-chat-form-clear" @click="emit('clear')">
          {{ options?.chatSettings?.labels?.clear || 'Clear Chat' }}
        </button>
      </template>
      <ChatSpinner v-else :small="true" />
    </form>
  </div>
</template>
