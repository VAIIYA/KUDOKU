<template>
  <transition name="pop">
    <div class="overlay" @click.self="$emit('dismiss')">
      <div class="picker-card">
        <p class="picker-title">Enter Number</p>

        <div class="num-grid">
          <button v-for="n in 9" :key="n" class="num-btn" @click="pick(n)">{{ n }}</button>
        </div>

        <button class="btn btn-err erase-btn" @click="$emit('erase')">
          ⌫ Erase
        </button>
        <button class="cancel-btn" @click="$emit('dismiss')">Cancel</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
const emit = defineEmits(['pick', 'erase', 'dismiss'])
function pick(n) { emit('pick', n) }
</script>

<style scoped>
.picker-card {
  background: linear-gradient(180deg, #2A1050 0%, #1A0A2E 100%);
  border: 2px solid rgba(255,107,157,0.65);
  border-radius: 26px;
  padding: 24px;
  width: 100%;
  max-width: 320px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.picker-title { font-size: 16px; font-weight: 800; color: white; }

.num-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;
}
.num-btn {
  background: linear-gradient(180deg, rgba(255,107,157,0.38) 0%, #2A1050 100%);
  border: 1.5px solid rgba(255,107,157,0.45);
  border-radius: 16px;
  color: white; font-family: inherit;
  font-size: 26px; font-weight: 900;
  padding: 16px 0;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.34,1.56,0.64,1), background 0.1s;
}
.num-btn:active { transform: scale(0.82); }

.erase-btn { width: 100%; font-size: 15px; border-radius: 14px; padding: 13px; }
.cancel-btn { background: none; border: none; color: var(--text-dim); font-family: inherit; font-size: 13px; cursor: pointer; padding: 4px; }
</style>
