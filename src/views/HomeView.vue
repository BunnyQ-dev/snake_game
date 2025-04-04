<template>
    <div>
      <!-- Вступна секція (була в App.vue) -->
      <div class="intro-section" v-if="!showGame">
        <div class="text-center">
          <h2 class="mb-3">Snake game</h2>
          <p class="text-muted mb-4">
            Do you remember old Snake game which was preinstalled on most old
            phones, now you can play it on this website!
          </p>
          <button class="btn btn-dark btn-lg" @click="startGameNow">Play now!</button>
        </div>
      </div>
  
      <!-- Секція гри (була в App.vue) -->
      <div class="game-section" v-else>
        <Game :autostart="true" @gameEnded="handleGameEnded" />
      </div>
    </div>
  </template>
  
  <script>
  import Game from "@/components/Game.vue"; // припускаємо, що Game.vue лежить у src/components/Game.vue
  
  export default {
    name: "HomeView",
    components: {
      Game,
    },
    data() {
      return {
        showGame: false,
      };
    },
    methods: {
      startGameNow() {
        this.showGame = true;
        // Забороняємо скрол під час гри
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      },
      handleGameEnded() {
        // Повертаємо скрол після завершення гри
        document.documentElement.style.overflow = "auto";
        document.body.style.overflow = "auto";
        // Можна, наприклад, повернутися в режим intro
        this.showGame = false;
      },
    },
    beforeDestroy() {
      // Ensure scroll is enabled when component is destroyed
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    },
  };
  </script>
  
  <style scoped>
  /* Якщо треба, можна перенести сюди (або залишити глобальні) стилі для .intro-section, .game-section тощо. */
  .intro-section {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  