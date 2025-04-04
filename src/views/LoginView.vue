<template>
  <div class="login-container mt-3">
    <div class="login-card">
      <div class="text-center mb-4">
        <img
          src="/src/assets/images/logo.png"
          alt="Snake logo"
          class="login-logo mb-3"
        />
        <h2 class="h4 mb-3">Welcome back</h2>
        <p class="text-muted">Sign in to continue to Snake Game</p>
      </div>

      <form @submit.prevent="loginUser" class="login-form">
        <!-- Email input -->
        <div class="form-floating mb-3">
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="email"
            placeholder="name@example.com"
            required
          />
          <label for="email">Email address</label>
        </div>

        <!-- Password input -->
        <div class="form-floating mb-3">
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary w-100 mb-3">
          Sign In
        </button>

        <!-- Google login -->
        <button 
          type="button" 
          @click="loginWithGoogle" 
          class="btn btn-outline-dark w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
        >
          <img src="/src/assets/images/google.svg" alt="Google" style="width: 18px;" />
          Sign in with Google
        </button>

        <!-- Register link -->
        <p class="text-center mb-0">
          Don't have an account? 
          <router-link to="/register" class="text-decoration-none">Create one</router-link>
        </p>
      </form>
      <div v-if="isLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style="z-index: 1000;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false
    };
  },
  created() {
    // Check for Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
      this.handleOAuthLogin(userId);
    }
  },
  methods: {
    loginWithGoogle() {
      // Redirect to the backend Google auth route
      window.location.href = 'http://localhost:3000/auth/google';
    },
    async handleOAuthLogin(userId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/get-user/${userId}`);
        localStorage.setItem('userId', userId);
        this.$root.$emit('user-logged-in', response.data);
        window.location.href = '/'; // Force reload to main page
      } catch (error) {
        this.errorMessage = 'Failed to complete login';
        this.isLoading = false;
      }
    },
    async loginUser() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          email: this.email,
          password: this.password
        });
        
        localStorage.setItem('userId', response.data.userId);
        const userResponse = await axios.get(`http://localhost:3000/api/get-user/${response.data.userId}`);
        this.$root.$emit('user-logged-in', userResponse.data);
        window.location.href = '/'; // Force reload to main page
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Login failed!';
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 76px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.login-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.form-floating > label {
  color: #6c757d;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Google button hover effect */
.btn-outline-dark:hover {
  background-color: #f8f9fa;
  color: #212529;
  border-color: #212529;
}
</style>