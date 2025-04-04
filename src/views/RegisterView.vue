<template>
  <div class="login-container mt-5">
    <div class="login-card mt-5">
      <div class="text-center mb-4">
        <img
          src="/src/assets/images/logo.png"
          alt="Snake logo"
          class="login-logo mb-3"
        />
        <h2 class="h4 mb-3">Create account</h2>
        <p class="text-muted">Sign up to start playing Snake Game</p>
      </div>

      <form @submit.prevent="registerUser" class="login-form">
        <!-- Nickname input -->
        <div class="form-floating mb-3">
          <input
            type="text"
            class="form-control"
            id="nickname"
            v-model="nickname"
            placeholder="Your nickname"
            required
          />
          <label for="nickname">Nickname</label>
        </div>

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

        <!-- Success message -->
        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary w-100 mb-3">
          Sign Up
        </button>

        <!-- Google registration -->
        <button 
          type="button" 
          @click="registerWithGoogle" 
          class="btn btn-outline-dark w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
        >
          <img src="/src/assets/images/google.svg" alt="Google" style="width: 18px;" />
          Sign up with Google
        </button>

        <!-- Login link -->
        <p class="text-center mb-0">
          Already have an account? 
          <router-link to="/login" class="text-decoration-none">Sign in</router-link>
        </p>
      </form>

      <!-- Loading spinner -->
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
  name: 'RegisterView',
  data() {
    return {
      nickname: '',
      email: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false
    };
  },
  created() {
    // Check for Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
      this.handleOAuthRegister(userId);
    }
  },
  methods: {
    registerWithGoogle() {
      // Redirect to the backend Google auth route with register flag
      window.location.href = 'http://localhost:3000/auth/google?register=true';
    },
    async handleOAuthRegister(userId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/get-user/${userId}`);
        localStorage.setItem('userId', userId);
        this.$root.$emit('user-logged-in', response.data);
        window.location.href = '/'; // Force reload to main page
      } catch (error) {
        this.errorMessage = 'Failed to complete registration';
        this.isLoading = false;
      }
    },
    async registerUser() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.nickname || !this.email || !this.password) {
        this.errorMessage = 'Please fill all the fields';
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/api/register', {
          nickname: this.nickname,
          email: this.email,
          password: this.password
        });

        localStorage.setItem('userId', response.data.userId);
        const userResponse = await axios.get(`http://localhost:3000/api/get-user/${response.data.userId}`);
        this.$root.$emit('user-logged-in', userResponse.data);
        window.location.href = '/'; // Force reload to main page
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Registration failed!';
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

.btn-outline-dark:hover {
  background-color: #f8f9fa;
  color: #212529;
  border-color: #212529;
}
</style>