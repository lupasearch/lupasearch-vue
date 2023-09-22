<script lang="ts" setup>
import { ref } from 'vue'
import ChatSpinner from './ChatSpinner.vue'

defineProps<{
  disabled?: boolean
}>()

const inputValue = ref('')
const emit = defineEmits(['submit'])

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
        />
      </div>
      <button v-if="!disabled" class="lupa-chat-form-submit">Ask LupaChat</button>
      <ChatSpinner v-else :small="true" />
    </form>
  </div>
</template>
