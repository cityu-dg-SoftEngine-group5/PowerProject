<script setup>
import { ref } from 'vue'

const messages = ref([])
const userInput = ref('')
const fileInput = ref(null)
const isLoading = ref(false)

// API configuration
const API_ENDPOINT = 'http://localhost:8080/ai/chat'
const API_HEADERS = {
  'Content-Type': 'application/json',
}

const handleSubmit = async () => {
  if (!userInput.value.trim() && !fileInput.value) return

  // Add user message
  const userMessage = {
    content: userInput.value,
    isUser: true,
    file: fileInput.value
  }
  messages.value.push(userMessage)

  // Clear inputs
  userInput.value = ''
  fileInput.value = null

  try {
    isLoading.value = true

    // Send request to API
    const aiResponse = await getAIResponse(userMessage)

    // Add AI response to messages
    messages.value.push({
      content: aiResponse.message,
      isUser: false,
      metadata: aiResponse.metadata // Additional data
    })
  } catch (error) {
    console.error('API request failed:', error)
    messages.value.push({
      content: "Request failed, please try again later",
      isUser: false
    })
  } finally {
    isLoading.value = false
  }
}

const getAIResponse = async (userMessage) => {
  // Prepare request body
  const requestBody = {
    message: {
      content: userMessage.content,
      type: 'text',
      timestamp: new Date().toISOString()
    },
    file_info: userMessage.file ? {
      name: userMessage.file.name,
      type: userMessage.file.type,
      size: userMessage.file.size
    } : null
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

  return response.json()
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
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      Getting response...
    </div>
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

<style scoped>
@import './style.css';
</style>