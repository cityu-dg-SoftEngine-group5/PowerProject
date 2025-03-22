<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  content: string
  isUser: boolean
  file?: File | null
}

const messages = ref<Message[]>([])
const userInput = ref('')
const fileInput = ref<File | null>(null)

const handleSubmit = () => {
  if (!userInput.value.trim() && !fileInput.value) return

  // Add user message
  messages.value.push({
    content: userInput.value,
    isUser: true,
    file: fileInput.value
  })

  // Clear inputs
  userInput.value = ''
  fileInput.value = null

  // Simulate AI response (you can replace this with actual API call)
  setTimeout(() => {
    messages.value.push({
      content: "This is a simulated AI response.",
      isUser: false
    })
  }, 1000)
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    fileInput.value = target.files[0]
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto p-4">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-blue-600">AI Chat Interface</h1>
      </header>

      <!-- Chat Container -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
        <!-- Messages -->
        <div class="space-y-4 mb-6 h-[400px] overflow-y-auto">
          <div v-for="(message, index) in messages"
               :key="index"
               :class="[
                 'p-4 rounded-lg max-w-[80%]',
                 message.isUser ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
               ]">
            <p>{{ message.content }}</p>
            <div v-if="message.file" class="mt-2 text-sm">
              📎 Attached file: {{ message.file.name }}
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t pt-4">
          <div class="flex gap-4">
            <input
                v-model="userInput"
                type="text"
                placeholder="Type your message..."
                class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                @keyup.enter="handleSubmit"
            />
            <label class="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
              📎
              <input
                  type="file"
                  class="hidden"
                  @change="handleFileUpload"
              />
            </label>
            <button
                @click="handleSubmit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
          <div v-if="fileInput" class="mt-2 text-sm text-gray-600">
            Selected file: {{ fileInput.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any additional custom styles here */
</style>