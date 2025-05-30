<script setup>
import { reactive, ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore'

const questions = [
  {
    id: '1',
    text: 'How do you feel today?',
    options: ['Awesome', 'Okay', 'Meh', 'Tired'],
  },
  {
    id: '2',
    text: 'What’s your vibe music?',
    options: ['Chill', 'Energetic', 'Sad', 'Happy'],
  },
  {
    id: '3',
    text: 'Pick a weekend plan:',
    options: ['Party', 'Read a book', 'Hike', 'Sleep'],
  },
]

const answers = reactive({})
const isSubmitted = ref(false)

// Initialize results counts
const results = reactive({})
questions.forEach(q => {
  results[q.id] = {}
  q.options.forEach(opt => {
    results[q.id][opt] = 0
  })
})

async function submitQuiz() {
  if (Object.keys(answers).length < questions.length) {
    alert('Please answer all questions!')
    return
  }
  try {
    await addDoc(collection(db, 'submissions'), {
      answers: { ...answers },
      timestamp: Date.now(),
    })
    isSubmitted.value = true
  } catch (e) {
    alert('Failed to save answers: ' + e.message)
  }
}

onMounted(() => {
  const q = query(collection(db, 'submissions'))
  onSnapshot(q, (snapshot) => {
    // Reset counts
    questions.forEach(q => {
      q.options.forEach(opt => {
        results[q.id][opt] = 0
      })
    })
    // Aggregate counts
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      for (const qId in data.answers) {
        const ans = data.answers[qId]
        if (results[qId] && results[qId][ans] !== undefined) {
          results[qId][ans]++
        }
      }
    })
  })
})

function resetQuiz() {
  isSubmitted.value = false
  Object.keys(answers).forEach(k => delete answers[k])
}
</script>

<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded shadow-md">
    <h2 class="text-3xl font-bold mb-6 text-center">Vibe Check Quiz</h2>

    <div v-if="!isSubmitted">
      <div v-for="q in questions" :key="q.id" class="mb-6">
        <p class="mb-2 font-semibold">{{ q.text }}</p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="option in q.options"
            :key="option"
            @click="answers[q.id] = option"
            :class="{
              'bg-purple-600 text-white': answers[q.id] === option,
              'bg-gray-200': answers[q.id] !== option
            }"
            class="px-4 py-2 rounded"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <button
        @click="submitQuiz"
        class="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition"
      >
        Submit
      </button>
    </div>

    <div v-else>
      <h3 class="text-xl font-semibold mb-4">Your Vibe Summary</h3>
      <ul class="list-disc pl-5 space-y-2 mb-6">
        <li v-for="q in questions" :key="q.id">
          <strong>{{ q.text }}</strong>: {{ answers[q.id] }}
        </li>
      </ul>

      <h3 class="text-xl font-semibold mb-4">Community Vibe Results</h3>
      <div v-for="q in questions" :key="q.id" class="mb-4">
        <p class="font-semibold mb-1">{{ q.text }}</p>
        <ul>
          <li
            v-for="option in q.options"
            :key="option"
            class="flex justify-between px-4 py-1 border rounded mb-1"
          >
            <span>{{ option }}</span>
            <span>{{ results[q.id][option] || 0 }}</span>
          </li>
        </ul>
      </div>

      <button
        @click="resetQuiz"
        class="mt-6 w-full bg-gray-300 py-2 rounded hover:bg-gray-400 transition"
      >
        Retake Quiz
      </button>
    </div>
  </div>
</template>
