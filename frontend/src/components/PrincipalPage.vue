<template>
  <div class="max-w-xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-800 text-gray-800 dark:text-gray-100">
    <h2 class="text-xl font-bold mb-4">Descargar video de YouTube</h2>
    <form @submit.prevent="handleDownload" class="space-y-4">
      <input v-model="url" type="text" placeholder="Pega aquí el enlace de YouTube"
        class="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white" />

      <select v-model="format" class="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white">
        <option value="mp3">MP3</option>
        <option value="mp4">MP4</option>
      </select>

      <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
        Descargar
      </button>

      <div v-if="isDownloading" class="mt-4">
        <p class="mb-1 text-sm">Descargando... {{ downloadProgress }}%</p>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div class="bg-blue-600 h-4 rounded-full transition-all duration-200"
            :style="{ width: downloadProgress + '%' }"></div>
        </div>
      </div>

    </form>

    <div v-if="isLoadingInfo" class="flex items-center space-x-2 mt-4 text-blue-600 dark:text-blue-400">
      <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span>Obteniendo información del video...</span>
    </div>

    <!-- Skeleton loader mientras se obtiene la info -->
    <div v-if="isLoadingInfo" class="mt-4 animate-pulse space-y-3">
      <div class="bg-gray-300 dark:bg-gray-700 h-48 w-full rounded"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
    </div>

    <div v-if="thumbnail" class="mt-4">
      <p class="mb-2">Miniatura del video:</p>
      <img :src="thumbnail" alt="Miniatura" class="w-full rounded shadow" />
      <p v-if="videoTitle" class="mt-2 font-semibold">Título: {{ videoTitle }}</p>
    </div>

    <div v-if="message" class="mt-4 text-green-600 dark:text-green-400">{{ message }}</div>
    <div v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</div>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import debounce from 'lodash/debounce'

const url = ref('')
const format = ref('mp3')
const message = ref('')
const error = ref('')
const thumbnail = ref('')
const videoTitle = ref('')

const downloadProgress = ref(0)
const isDownloading = ref(false)

const isLoadingInfo = ref(false)



const handleDownload = async () => {
  message.value = ''
  error.value = ''
  downloadProgress.value = 0
  isDownloading.value = true

  try {
    const nameRes = await axios.post('http://localhost:3001/api/title', {
      url: url.value,
      format: format.value
    })
    const filename = nameRes.data.filename || `video.${format.value}`

    // Inicia barra de progreso simulada
    const fakeProgress = setInterval(() => {
      if (downloadProgress.value < 95) {
        downloadProgress.value += 1
      }
    }, 100)

    const response = await axios.post('http://localhost:3001/api/download', {
      url: url.value,
      format: format.value,
    }, {
      responseType: 'blob'
    })

    clearInterval(fakeProgress)
    downloadProgress.value = 100

    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()

    message.value = `¡Descarga completada: ${filename}!`
  } catch (err) {
    console.error(err)
    error.value = 'Error al descargar el video. Asegúrate de que el enlace es válido.'
  } finally {
    isDownloading.value = false
    setTimeout(() => downloadProgress.value = 0, 2000)
  }
}



// Función real de consulta a backend
const fetchThumbnail = async () => {
  if (!url.value) return

  isLoadingInfo.value = true

  try {
    const response = await axios.post('http://localhost:3001/api/thumbnail', {
      url: url.value,
    })
    console.log('Respuesta del backend:', response.data)
    thumbnail.value = response.data.thumbnail
    videoTitle.value = response.data.title || ''
  } catch (err) {
    console.error('No se pudo obtener la miniatura')
    thumbnail.value = ''
    videoTitle.value = ''
  } finally {
    isLoadingInfo.value = false
  }
}

// Debounce para evitar múltiples llamadas seguidas
const debouncedFetchThumbnail = debounce(fetchThumbnail, 700) // espera 700ms

// Observa cambios en el input y llama a la función con debounce
watch(url, () => {

  message.value = ''
  error.value = ''
  thumbnail.value = ''
  videoTitle.value = ''

  debouncedFetchThumbnail()
})

</script>
