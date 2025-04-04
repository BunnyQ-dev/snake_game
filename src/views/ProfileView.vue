<template>
  <div class="space"></div>
  <div class="profile-container py-5 mt-5">
    <div class="container mt-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row">
        <!-- Left Column - User Info -->
        <div class="col-md-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="user-avatar mb-3">
                <div class="avatar-circle">
                  {{ user?.nickname?.[0]?.toUpperCase() || '?' }}
                </div>
              </div>
              <h3 class="card-title mb-1">{{ user?.nickname }}</h3>
              <p class="text-muted">{{ user?.email }}</p>
              <hr>
              <div class="d-flex justify-content-around text-center">
                <div>
                  <h5>{{ totalGames }}</h5>
                  <small class="text-muted">Games</small>
                </div>
                <div>
                  <h5>{{ bestScore }}</h5>
                  <small class="text-muted">Best Score</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Password & Games -->
        <div class="col-md-8">
          <!-- Password Change Section -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h4 class="card-title mb-4">Change Password</h4>
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label class="form-label">Current Password</label>
                  <input
                    type="password"
                    v-model="oldPassword"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">New Password</label>
                  <input
                    type="password"
                    v-model="newPassword"
                    class="form-control"
                    required
                  />
                </div>
                <div v-if="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="alert alert-success">
                  {{ successMessage }}
                </div>
                <button type="submit" class="btn btn-primary">
                  Update Password
                </button>
              </form>
            </div>
          </div>

          <!-- Game History -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="card-title mb-0">Game History</h4>
                <button @click="loadGames" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-arrow-clockwise"></i> Refresh
                </button>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="game in paginatedGames" :key="game.id">
                      <td>{{ formatDate(game.startTime) }}</td>
                      <td>
                        <span :class="getScoreClass(game.score)">
                          {{ game.score }}
                        </span>
                      </td>
                      <td>{{ formatDuration(game.duration) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                <nav aria-label="Game history pagination">
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                        Previous
                      </a>
                    </li>
                    <li v-for="page in totalPages" 
                        :key="page" 
                        class="page-item"
                        :class="{ active: currentPage === page }">
                      <a class="page-link" href="#" @click.prevent="changePage(page)">
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

              <div v-if="games?.length === 0" class="text-center py-4 text-muted">
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
  name: 'ProfileView',
  data() {
    return {
      user: null,
      games: null,
      oldPassword: '',
      newPassword: '',
      errorMessage: '',
      successMessage: '',
      isLoading: true,
      bestScore: 0,
      totalGames: 0,
      currentPage: 1,
      gamesPerPage: 10
    };
  },
  computed: {
    totalPages() {
      return Math.ceil((this.games?.length || 0) / this.gamesPerPage);
    },
    paginatedGames() {
      if (!this.games) return [];
      const start = (this.currentPage - 1) * this.gamesPerPage;
      const end = start + this.gamesPerPage;
      return this.games.slice(start, end);
    }
  },
  async created() {
    await this.loadUserData();
    await this.loadGames();
    this.isLoading = false;
  },
  methods: {
    async loadUserData() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.$router.push('/login');
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:3000/api/get-user/${userId}`);
        this.user = response.data;
      } catch (error) {
        this.errorMessage = 'Failed to load user data';
      }
    },
    async loadGames() {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/my-games?userId=${userId}`);
        this.games = response.data;
        this.calculateStats();
      } catch (error) {
        this.errorMessage = 'Failed to load games';
      }
    },
    calculateStats() {
      if (this.games && this.games.length > 0) {
        this.totalGames = this.games.length;
        this.bestScore = Math.max(...this.games.map(game => game.score || 0));
      }
    },
    async changePassword() {
      this.errorMessage = '';
      this.successMessage = '';
      
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      try {
        await axios.post('http://localhost:3000/api/change-password', {
          userId,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        });
        
        this.successMessage = 'Password updated successfully';
        this.oldPassword = '';
        this.newPassword = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Failed to change password';
      }
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
      if (score >= this.bestScore) return 'text-success fw-bold';
      if (score >= this.bestScore * 0.7) return 'text-primary';
      return 'text-muted';
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
.profile-container {
  background-color: #f8f9fa;
  min-height: calc(100vh - 76px);
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto;
}

.user-avatar {
  margin-top: -1rem;
}

.card {
  border-radius: 15px;
  overflow: hidden;
}

.table > :not(:first-child) {
  border-top: none;
}

.table td {
  vertical-align: middle;
}

.space {
  margin-top: 500px;
}

.pagination {
  margin-bottom: 0;
}
</style>