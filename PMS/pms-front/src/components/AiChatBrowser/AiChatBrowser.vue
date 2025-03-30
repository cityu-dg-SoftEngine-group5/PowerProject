<script setup>
import { ref } from 'vue'

const messages = ref([])
const userInput = ref('')
const fileInput = ref(null)

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

  // Simulate AI response
  setTimeout(() => {
    messages.value.push({
      content: "This is a simulated AI response.",
      isUser: false
    })
  }, 1000)
}

const handleFileUpload = (event) => {
  const target = event.target
  if (target.files) {
    fileInput.value = target.files[0]
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <h1>AI Chat Interface</h1>
      </header>

      <!-- Chat Container -->
      <div class="chat-container">
        <!-- Messages -->
        <div class="messages">
          <div v-for="(message, index) in messages"
               :key="index"
               :class="['message', message.isUser ? 'user' : 'ai']">
            <p>{{ message.content }}</p>
            <div v-if="message.file" class="file-info">
              📎 Attached file: {{ message.file.name }}
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <input
                v-model="userInput"
                type="text"
                placeholder="Type your message..."
                class="text-input"
                @keyup.enter="handleSubmit"
            />
            <label class="file-label">
              📎
              <input
                  type="file"
                  class="file-input"
                  @change="handleFileUpload"
              />
            </label>
            <button
                @click="handleSubmit"
                class="send-button"
            >
              Send
            </button>
          </div>
          <div v-if="fileInput" class="file-info">
            Selected file: {{ fileInput.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>