<template>
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <div class="container py-3 d-flex justify-content-between align-items-center">
        <!-- Logo section -->
        <div class="d-flex align-items-center">
          <img
            src="/src/assets/images/logo.png"
            alt="Snake logo"
            style="height: 40px; width: 40px; margin-right: 10px;"
          />
          <router-link to="/" class="h3 text-dark text-decoration-none mb-0">
            Snake
          </router-link>
        </div>

        <!-- Navigation and user menu -->
        <nav class="d-flex align-items-center">
          <router-link to="/leaderboard" class="text-dark text-decoration-none mx-3">
            Leaderboard
          </router-link>
          <router-link to="/about" class="text-dark text-decoration-none mx-3">
            About
          </router-link>

          <!-- User logged in -->
          <div v-if="userData" class="dropdown">
            <button 
              class="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center" 
              type="button" 
              id="userMenu" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <!-- User avatar circle with first letter -->
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                   style="width: 35px; height: 35px;">
                {{ userData.nickname?.charAt(0).toUpperCase() }}
              </div>
              {{ userData.nickname }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
              <li>
                <router-link to="/profile" class="dropdown-item">
                  <i class="bi bi-person me-2"></i> Profile
                </router-link>
              </li>
              <li>
                <router-link to="/my-games" class="dropdown-item">
                  <i class="bi bi-controller me-2"></i> My Games
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button @click="logoutUser" class="dropdown-item text-danger">
                  <i class="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>

          <!-- User not logged in -->
          <div v-else>
            <router-link to="/login" class="btn btn-primary">
              Sign In
            </router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="main-container">
      <router-view @user-logged-in="handleUserLogin"></router-view>
    </main>

    <AppFooter />

  </div>
</template>

<script>
import axios from 'axios';
import AppFooter from './components/AppFooter.vue';

export default {
  components: {
    AppFooter
  },
  name: "App",
  data() {
    return {
      userData: null,
    };
  },
  created() {
    this.checkUserAuth();
  },
  methods: {
    async checkUserAuth() {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:3000/api/get-user/${userId}`);
          this.userData = response.data;
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem("userId");
          this.userData = null;
        }
      }
    },
    handleUserLogin(userData) {
      this.userData = userData;
    },
    async logoutUser() {
      localStorage.removeItem("userId");
      this.userData = null;
      await this.$router.push("/");
    },
  },
  watch: {
    '$route'(to, from) {
      // Check URL parameters for userId (Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      if (userId) {
        this.checkUserAuth();
      }
    }
  }
};
</script>

<style>
/* Add Bootstrap icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css");

/* Your existing styles */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: #fff;
  z-index: 999;
  border-bottom: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-container {
  margin-top: 76px;
  flex: 1 0 auto;
  background: #fff;
  padding: 20px 0;
}

/* Dropdown menu improvements */
.dropdown-menu {
  padding: 0.5rem 0;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 0.5rem;
}

.dropdown-item {
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-divider {
  margin: 0.5rem 0;
}
</style>