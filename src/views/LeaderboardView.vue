<template>
  <div class="space"></div>
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-white py-3">
              <h2 class="h4 mb-0">🏆 Leaderboard</h2>
            </div>
            <div class="card-body">
              <!-- Loading state -->
              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
  
              <!-- Error state -->
              <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>
  
              <!-- Leaderboard table -->
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Rank</th>
                      <th scope="col">Player</th>
                      <th scope="col">Score</th>
                      <th scope="col">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(score, index) in leaderboardData" :key="index">
                      <td>
                        <span :class="getRankClass(index + 1)">{{ index + 1 }}</span>
                      </td>
                      <td>{{ score.nickname }}</td>
                      <td>{{ score.score }}</td>
                      <td>{{ formatDate(score.endTime) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
  
              <!-- No data state -->
              <div v-if="!isLoading && !error && leaderboardData.length === 0" class="text-center py-4">
                <p class="text-muted mb-0">No games played yet. Be the first one to set a record!</p>
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
    name: 'LeaderboardView',
    data() {
      return {
        leaderboardData: [],
        isLoading: true,
        error: null
      };
    },
    async created() {
      await this.fetchLeaderboardData();
    },
    methods: {
      async fetchLeaderboardData() {
        try {
          const response = await axios.get('http://localhost:3000/api/leaderboard');
          this.leaderboardData = response.data;
        } catch (error) {
          this.error = 'Failed to load leaderboard data';
          console.error('Leaderboard error:', error);
        } finally {
          this.isLoading = false;
        }
      },
      getRankClass(rank) {
        const classes = {
          1: 'badge bg-warning text-dark',
          2: 'badge bg-secondary',
          3: 'badge bg-danger'
        };
        return classes[rank] || 'badge bg-light text-dark';
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
      }
    }
  };
  </script>
  
  <style scoped>
  .badge {
    font-size: 0.9rem;
    padding: 0.5em 0.7em;
  }

  .space {
    margin-top: 200px;
  }
  </style>