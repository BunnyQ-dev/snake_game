<template>
  <div class="space"></div>
  <div class="games-container py-5 mt-5">
    <div class="container mt-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row">
        <!-- Left Column - Statistics -->
        <div class="col-md-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h4 class="card-title mb-4">Statistics</h4>
              <div class="stats-grid">
                <div class="stat-item text-center p-3">
                  <div class="stat-value h3 mb-2">{{ totalGames }}</div>
                  <div class="stat-label text-muted">Total Games</div>
                </div>
                <div class="stat-item text-center p-3">
                  <div class="stat-value h3 mb-2">{{ bestScore }}</div>
                  <div class="stat-label text-muted">Best Score</div>
                </div>
                <div class="stat-item text-center p-3">
                  <div class="stat-value h3 mb-2">{{ averageScore }}</div>
                  <div class="stat-label text-muted">Average Score</div>
                </div>
                <div class="stat-item text-center p-3">
                  <div class="stat-value h3 mb-2">{{ totalPlayTime }}</div>
                  <div class="stat-label text-muted">Total Play Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Game History -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="card-title mb-0">Game History</h4>
                <div class="d-flex gap-2">
                  <select v-model="sortBy" class="form-select form-select-sm" style="width: auto;">
                    <option value="date">Sort by Date</option>
                    <option value="score">Sort by Score</option>
                    <option value="duration">Sort by Duration</option>
                  </select>
                  <button @click="loadGames" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="game in paginatedGames" :key="game.id">
                      <td>{{ formatDate(game.startTime) }}</td>
                      <td>
                        <span :class="getScoreClass(game.score)">
                          {{ game.score || 'N/A' }}
                        </span>
                      </td>
                      <td>{{ formatDuration(game.duration) }}</td>
                      <td>
                        <span :class="getStatusClass(game)">
                          {{ getGameStatus(game) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted small">
                  Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ sortedGames.length }} games
                </div>
                <nav aria-label="Game history pagination">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                        Previous
                      </a>
                    </li>
                    <li v-for="page in displayedPages" 
                        :key="page" 
                        class="page-item"
                        :class="{ active: currentPage === page, disabled: page === '...' }">
                      <a class="page-link" href="#" @click.prevent="page === '...' ? null : changePage(page)">
                        {{ page }}
                      </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div v-if="sortedGames.length === 0" class="text-center py-4 text-muted">
                No games played yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MyGamesView',
  data() {
    return {
      games: [],
      isLoading: true,
      sortBy: 'date',
      bestScore: 0,
      totalGames: 0,
      averageScore: 0,
      totalPlayTime: '0h 0m',
      currentPage: 1,
      gamesPerPage: 10
    };
  },
  computed: {
    sortedGames() {
      const sorted = [...this.games];
      switch (this.sortBy) {
        case 'score':
          return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        case 'duration':
          return sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        default: // date
          return sorted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      }
    },
    totalPages() {
      return Math.ceil(this.sortedGames.length / this.gamesPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.gamesPerPage;
    },
    endIndex() {
      return Math.min(this.startIndex + this.gamesPerPage, this.sortedGames.length);
    },
    paginatedGames() {
      return this.sortedGames.slice(this.startIndex, this.endIndex);
    },
    displayedPages() {
      const pages = [];
      const totalPages = this.totalPages;
      const current = this.currentPage;

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        if (current > 3) pages.push('...');
        
        for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, totalPages - 1); i++) {
          pages.push(i);
        }
        
        if (current < totalPages - 2) pages.push('...');
        pages.push(totalPages);
      }

      return pages;
    }
  },
  watch: {
    sortBy() {
      this.currentPage = 1; // Reset to first page when sorting changes
    }
  },
  async created() {
    await this.loadGames();
    this.isLoading = false;
  },
  methods: {
    async loadGames() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.$router.push('/login');
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:3000/api/my-games?userId=${userId}`);
        this.games = response.data;
        this.calculateStats();
      } catch (error) {
        console.error('Failed to load games:', error);
      }
    },
    calculateStats() {
      if (this.games.length === 0) return;

      this.bestScore = Math.max(...this.games.map(game => game.score || 0));
      this.totalGames = this.games.length;
      
      const totalScore = this.games.reduce((sum, game) => sum + (game.score || 0), 0);
      this.averageScore = Math.round(totalScore / this.totalGames);
      
      const totalSeconds = this.games.reduce((total, game) => total + (game.duration || 0), 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      this.totalPlayTime = `${hours}h ${minutes}m`;
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatDuration(seconds) {
      if (!seconds) return 'N/A';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },
    getScoreClass(score) {
      if (!score) return 'text-muted';
      if (score >= this.bestScore) return 'text-success fw-bold';
      if (score >= this.bestScore * 0.7) return 'text-primary';
      return 'text-muted';
    },
    getGameStatus(game) {
      if (!game.endTime) return 'In Progress';
      return 'Completed';
    },
    getStatusClass(game) {
      if (!game.endTime) return 'badge bg-warning';
      return 'badge bg-success';
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
};
</script>

<style scoped>
.games-container {
  background-color: #f8f9fa;
  min-height: calc(100vh - 76px);
}

.card {
  border-radius: 15px;
  overflow: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background-color: #f8f9fa;
  border-radius: 10px;
}

.stat-value {
  color: #007bff;
  font-weight: bold;
}

.table > :not(:first-child) {
  border-top: none;
}

.table td {
  vertical-align: middle;
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.8em;
}

.space {
  margin-top: 300px;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
}
</style>