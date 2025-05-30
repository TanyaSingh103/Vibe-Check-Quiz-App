<script setup>
import { reactive, ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore'

const questions = [
  { id: '1', text: 'How do you feel today?', options: ['Awesome', 'Okay', 'Meh', 'Tired'] },
  { id: '2', text: 'What’s your vibe music?', options: ['Chill', 'Energetic', 'Sad', 'Happy'] },
  { id: '3', text: 'Pick a weekend plan:', options: ['Party', 'Read a book', 'Hike', 'Sleep'] },
  { id: '4', text: 'Your go-to drink?', options: ['Coffee', 'Tea', 'Smoothie', 'Soda'] },
  { id: '5', text: 'Ideal vacation spot?', options: ['Beach', 'Mountains', 'City', 'Countryside'] },
  { id: '6', text: 'Your current mood color?', options: ['Blue', 'Pink', 'Yellow', 'Green'] },
  { id: '7', text: 'Favorite time of day?', options: ['Morning', 'Afternoon', 'Evening', 'Night'] },
  { id: '8', text: 'Pick a pet:', options: ['Dog', 'Cat', 'Bird', 'Fish'] },
  { id: '9', text: 'Preferred workspace?', options: ['Cafe', 'Home', 'Library', 'Park'] },
  { id: '10', text: 'Your energy level now?', options: ['High', 'Medium', 'Low', 'Zero'] },
]

const answers = reactive({})
const isSubmitted = ref(false)
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
    questions.forEach(q => {
      q.options.forEach(opt => {
        results[q.id][opt] = 0
      })
    })
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
  <div class="container">
    <div class="quiz-card">
      <h1 class="title">🎯 Vibe Check Quiz</h1>

      <div v-if="!isSubmitted">
        <div v-for="q in questions" :key="q.id" class="question-block">
          <p class="question-text">{{ q.text }}</p>
          <div class="options">
            <button
              v-for="option in q.options"
              :key="option"
              @click="answers[q.id] = option"
              :class="['option-btn', answers[q.id] === option ? 'selected' : '']"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <button @click="submitQuiz" class="submit-btn">Submit ✅</button>
      </div>

      <div v-else>
        <h3 class="subtitle">Your Vibe Summary 💫</h3>
        <ul class="summary-list">
          <li v-for="q in questions" :key="q.id">
            <strong>{{ q.text }}</strong>: {{ answers[q.id] }}
          </li>
        </ul>

        <h3 class="subtitle">Community Vibe Results 🌍</h3>
        <div v-for="q in questions" :key="q.id" class="result-block">
          <p class="result-question">{{ q.text }}</p>
          <ul class="result-list">
            <li v-for="option in q.options" :key="option" class="result-item">
              <span>{{ option }}</span>
              <span>{{ results[q.id][option] || 0 }}</span>
            </li>
          </ul>
        </div>

        <button @click="resetQuiz" class="retake-btn">Retake Quiz 🔁</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  min-width: 80vw; /* full viewport width */
  background: #fff;
  color: #333;
  display: flex;
  align-items: stretch; /* stretch vertically */
  justify-content: stretch; /* stretch horizontally */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
  /* Optional: add some gap */
  gap: 20px;
}

.quiz-card {
  flex-grow: 1;       /* take up all available space */
  max-width: none;    /* remove max-width to allow full width */
  width: 100%;        /* fill horizontally */
  background: #fff;
  box-shadow: 0 15px 30px rgba(255, 105, 180, 0.3);
  border-radius: 24px;
  padding: 30px 40px;
  overflow-y: auto;   /* scroll inside if content too tall */
  display: flex;
  flex-direction: column;
  /* Optional: set a min-width if needed */
  min-width: 320px;
}


.title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #ec4899; /* pink-500 */
  margin-bottom: 30px;
}

.question-block {
  margin-bottom: 24px;
  text-align: left;
  padding-left: 18vw;
}

.question-text {
  font-weight: 600;
  font-size: 1.15rem;
  margin-bottom: 12px;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-btn {
  background: #fbcfe8; /* pink-200 */
  color: #4b5563; /* gray-700 */
  padding: 10px 20px;
  border-radius: 9999px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  flex: 1 1 auto;
  max-width: 160px;
}

.option-btn:hover {
  background: #f9a8d4; /* pink-300 */
  color: white;
  transform: scale(1.05);
}

.option-btn.selected {
  background: #ec4899; /* pink-500 */
  color: white;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.6);
  transform: scale(1.05);
}

.submit-btn {
  margin-top: 20px;
  width: 100%;
  background-color: #86efac; /* green-300 */
  color: white;
  font-weight: 700;
  padding: 14px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1.1rem;
}

.submit-btn:hover {
  background-color: #4ade80; /* green-400 */
}

.subtitle {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #db2777; /* pink-600 */
  text-align: left;
}

.summary-list {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.result-block {
  margin-bottom: 20px;
  text-align: left;
}

.result-question {
  font-weight: 600;
  margin-bottom: 8px;
}

.result-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  background-color: #fff0f6; /* pink-50 */
  border: 1px solid #f9a8d4; /* pink-300 */
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 6px;
  font-weight: 500;
}

.retake-btn {
  margin-top: 30px;
  width: 100%;
  background-color: #bfdbfe; /* blue-300 */
  color: #374151; /* gray-700 */
  font-weight: 600;
  padding: 14px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1.1rem;
}

.retake-btn:hover {
  background-color: #93c5fd; /* blue-400 */
}
</style>
