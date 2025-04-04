<template>
  <div class="space"></div>
  <div class="text-center">
    <!-- Панель з рахунками -->
      <div class="py-3" style="background-color: #333; color: #fff;">
      <h2 class="h5 mb-1">Score: {{ score }}</h2>
      <p class="mb-0">Best Score: {{ bestScore }}</p>
      <p class="mb-0">Duration: {{ formatDuration(duration) }}</p>
    </div>

    <!-- Поле гри -->
    <canvas
      ref="gameCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      style="display: block; margin: 0 auto; border: 1px solid #000;"
    ></canvas>

    <!-- Повідомлення про завершення гри + Кнопка перезапуску -->
    <div v-if="gameOver" class="mt-3">
      <div class="alert alert-danger" role="alert">
        <strong>Game Over!</strong><br />
        Your Score: {{ score }}
      </div>
      <button @click="restartGame" class="btn btn-primary">Restart</button>
    </div>

    <!-- Кнопки управління гри -->
    <!-- Якщо гра не запущена або вже завершена - кнопка "Play" -->
    <div v-if="(!isPlaying && !gameOver)" class="mt-3">
      <button @click="startGame" class="btn btn-success">Play</button>
    </div>
    <!-- Якщо гра йде (isPlaying==true) і не на паузі - показуємо Pause -->
    <div v-else-if="isPlaying && !isPaused && !gameOver" class="mt-3">
      <button @click="togglePause" class="btn btn-warning">Pause</button>
    </div>
    <!-- Якщо гра на паузі (isPaused==true) і не завершена - Resume -->
    <div v-else-if="isPlaying && isPaused && !gameOver" class="mt-3">
      <button @click="togglePause" class="btn btn-success">Resume</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Game",
  props: {
    autostart: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Розміри поля
      box: 20,
      rows: 25,
      cols: 40,
      score: 0,
      bestScore: 0,
      duration: 0,
      durationInterval: null,

      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      food: { x: 8, y: 5 },
      specialFood: null,
      dir: "right",
      gameInterval: null,
      spawnInterval: null,
      images: {
        head: {
          up: new Image(),
          down: new Image(),
          left: new Image(),
          right: new Image(),
        },
        body: new Image(),
        fruit: new Image(),
        specialFruit: new Image(),
      },
      gameOver: false,
      imagesLoaded: false,
      isPaused: false,
      isPlaying: false,
    };
  },
  computed: {
    canvasWidth() {
      return this.box * this.cols;
    },
    canvasHeight() {
      return this.box * this.rows;
    },
  },
  mounted() {
    this.loadBestScore();
    this.initializeImages();
  },

  beforeUnmount() {
    this.cleanupGame();
  },

  methods: {
    initializeImages() {
      this.images.head.up.src = "/img/Snake_head_up.png";
      this.images.head.down.src = "/img/Snake_head_down.png";
      this.images.head.left.src = "/img/Snake_head_left.png";
      this.images.head.right.src = "/img/Snake_head_right.png";
      this.images.body.src = "/img/Snake_body.png";
      this.images.fruit.src = "/img/Fruit.png";
      this.images.specialFruit.src = "/img/SpecialFruit.png";

      const allImages = [
        this.images.head.up,
        this.images.head.down,
        this.images.head.left,
        this.images.head.right,
        this.images.body,
        this.images.fruit,
        this.images.specialFruit,
      ];

      let loadedImagesCount = 0;
      allImages.forEach((image) => {
        image.onload = () => {
          loadedImagesCount++;
          if (loadedImagesCount === allImages.length) {
            this.imagesLoaded = true;
            if (this.autostart) {
              this.startGame();
            }
          }
        };
      });
    },

    formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

    saveScore(duration) {
    let userId = this.$parent?.userId;
    if (!userId) {
      userId = localStorage.getItem('userId');
    }

    if (!userId) {
      console.warn("No userId found! Score won't be saved.");
      return;
    }

    axios
      .post("http://localhost:3000/api/save-score", {
        userId,
        score: this.score,
        duration: this.duration
      })
      .then(() => {
        console.log("Score and duration saved successfully!");
        this.loadBestScore();
      })
      .catch((error) => {
        console.error("Error saving score:", error);
      });
  },

    // Load the best score
    loadBestScore() {
      let userId = this.$parent?.userId;
      if (!userId) {
        userId = localStorage.getItem('userId');
      }

      if (!userId) {
        console.warn("No userId found! Best score won't be loaded.");
        return;
      }

      axios
        .get(`http://localhost:3000/api/get-best-score?userId=${userId}`)
        .then((response) => {
          this.bestScore = response.data.bestScore;
        })
        .catch((error) => {
          console.error("Error loading best score:", error);
        });
    },

    // Початок гри
    startGame() {
      this.isPlaying = true;
      this.isPaused = false;
      this.gameOver = false;

      document.body.style.overflow = "hidden";

      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext("2d");

      this.duration = 0;
      this.durationInterval = setInterval(() => {
        if (!this.isPaused) {
          this.duration++;
        }
      }, 1000);
      
      this.gameInterval = setInterval(() => {
        if (!this.isPaused) {
          this.drawGame(ctx);
        }
      }, 100);

      document.addEventListener("keydown", this.changeDirection);
      this.spawnInterval = setInterval(this.spawnSpecialFruit, 20000);
    },

    // Відстеження натискань клавіш (зміна напрямку)
    changeDirection(event) {
      if (event.key === "ArrowLeft" && this.dir !== "right") this.dir = "left";
      else if (event.key === "ArrowRight" && this.dir !== "left") this.dir = "right";
      else if (event.key === "ArrowUp" && this.dir !== "down") this.dir = "up";
      else if (event.key === "ArrowDown" && this.dir !== "up") this.dir = "down";
    },

    // Головний цикл рендерингу
    drawGame(ctx) {
      if (!this.imagesLoaded) return;

      // Фон
      ctx.fillStyle = "#006400";
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Звичайний фрукт
      ctx.drawImage(
        this.images.fruit,
        this.food.x * this.box,
        this.food.y * this.box,
        this.box,
        this.box
      );

      // Спец-фрукт
      if (this.specialFood) {
        ctx.drawImage(
          this.images.specialFruit,
          this.specialFood.x * this.box,
          this.specialFood.y * this.box,
          this.box,
          this.box
        );
      }

      // Малюємо змійку
      for (let i = 0; i < this.snake.length; i++) {
        const segment = this.snake[i];
        let imgToDraw;
        if (i === 0) {
          // голова
          if (this.dir === "up") imgToDraw = this.images.head.up;
          else if (this.dir === "down") imgToDraw = this.images.head.down;
          else if (this.dir === "left") imgToDraw = this.images.head.left;
          else if (this.dir === "right") imgToDraw = this.images.head.right;
        } else {
          // тіло
          imgToDraw = this.images.body;
        }
        ctx.drawImage(
          imgToDraw,
          segment.x * this.box,
          segment.y * this.box,
          this.box,
          this.box
        );
      }

      // Рухаємо змійку та перевіряємо зіткнення
      this.moveSnake();
      this.checkCollision();
    },

    // Логіка руху змійки
    moveSnake() {
      const head = { ...this.snake[0] };

      if (this.dir === "right") head.x += 1;
      else if (this.dir === "left") head.x -= 1;
      else if (this.dir === "up") head.y -= 1;
      else if (this.dir === "down") head.y += 1;

      // Зациклення по краях
      if (head.x < 0) head.x = this.cols - 1;
      else if (head.x >= this.cols) head.x = 0;
      if (head.y < 0) head.y = this.rows - 1;
      else if (head.y >= this.rows) head.y = 0;

      // Додаємо нову голову
      this.snake.unshift(head);

      // Якщо з'їли звичайний фрукт
      if (head.x === this.food.x && head.y === this.food.y) {
        this.score += 100;
        this.food = {
          x: Math.floor(Math.random() * this.cols),
          y: Math.floor(Math.random() * this.rows),
        };
      } else {
        // Відрізаємо хвіст
        this.snake.pop();
      }

      // Якщо з'їли спец-фрукт
      if (
        this.specialFood &&
        head.x === this.specialFood.x &&
        head.y === this.specialFood.y
      ) {
        this.score += 1000;
        // подовжуємо
        this.snake.push({ ...this.snake[this.snake.length - 1] });
        this.specialFood = null;
      }
    },

    // Спавн спец-фруктів
    spawnSpecialFruit() {
      const x = Math.floor(Math.random() * this.cols);
      const y = Math.floor(Math.random() * this.rows);
      this.specialFood = { x, y };
    },

    // Перевірка зіткнення із собою
    checkCollision() {
      const head = this.snake[0];
      for (let i = 1; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
          this.handleGameOver();
          return;
        }
      }
    },

    // Завершення гри
    handleGameOver() {
      this.cleanupGame();
      this.saveScore();
      this.gameOver = true;
      this.isPlaying = false;
      // Re-enable scrolling
      document.body.style.overflow = "auto";
    },

    togglePause() {
      this.isPaused = !this.isPaused;
      // Enable scrolling when paused
      if (this.isPaused) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "hidden";
      }
    },

    cleanupGame() {
      clearInterval(this.gameInterval);
      clearInterval(this.durationInterval);
      clearInterval(this.spawnInterval);
      document.removeEventListener("keydown", this.changeDirection);
      document.body.style.overflow = "auto";
    },

    // Перезапуск гри (без автозапуску)
    restartGame() {
      this.cleanupGame();
      this.gameOver = false;
      this.score = 0;
      this.snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      this.food = { x: 8, y: 5 };
      this.specialFood = null;
      this.dir = "right";
      this.isPaused = false;
      this.isPlaying = false;
    },
  },
};
</script>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
}
.space{
  margin-top: 150px;
}
</style>