<template>
  <div class="splash">
    <div class="sparkles">
      <span v-for="i in 8" :key="i" class="sparkle" :style="sparkleStyle(i)">✨</span>
    </div>
    <div class="logo" :class="{ visible: show }">
      <div class="cat" :class="{ pulse: show }">🐱</div>
      <h1>KUDOKU</h1>
      <p class="sub">Kawaii Sudoku</p>
    </div>
    <p class="tag" :class="{ visible: showTag }">✨ Solve • Level Up • Stay Cute ✨</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const show    = ref(false)
const showTag = ref(false)

onMounted(() => {
  setTimeout(() => show.value = true, 100)
  setTimeout(() => showTag.value = true, 700)
  setTimeout(() => router.replace('/home'), 2500)
})

function sparkleStyle(i) {
  return {
    left:             `${10 + (i - 1) * 11}%`,
    top:              `${15 + ((i % 3) * 22)}%`,
    fontSize:         `${12 + i * 3}px`,
    animationDelay:   `${i * 0.18}s`,
    animationDuration:`${1.0 + i * 0.2}s`,
  }
}
</script>

<style scoped>
.splash {
  height: 100dvh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(180deg, #1A0A2E 0%, #3D0D6B 50%, #1A0A2E 100%);
  overflow: hidden; position: relative;
}
.sparkles { position: absolute; inset: 0; pointer-events: none; }
.sparkle {
  position: absolute;
  animation: twinkle var(--dur, 1.2s) ease-in-out infinite alternate;
  opacity: 0.25;
}
@keyframes twinkle { to { opacity: 1; } }

.logo { text-align: center; opacity: 0; transform: scale(0.6); transition: all 0.7s cubic-bezier(0.34,1.56,0.64,1); }
.logo.visible { opacity: 1; transform: scale(1); }

.cat { font-size: 80px; display: block; }
.cat.pulse { animation: catPulse 1.5s ease-in-out infinite alternate; }
@keyframes catPulse { to { transform: scale(1.12); } }

h1 { font-size: 52px; font-weight: 900; color: white; letter-spacing: 4px; margin: 4px 0; }
.sub { font-size: 18px; font-weight: 600; color: var(--pink); letter-spacing: 2px; }

.tag { font-size: 13px; color: var(--text-dim); margin-top: 24px; opacity: 0; transition: opacity 0.6s 0.1s; }
.tag.visible { opacity: 1; }
</style>
