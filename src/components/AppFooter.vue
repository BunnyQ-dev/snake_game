<template>
  <footer class="footer mt-auto py-4 bg-light border-top">
    <div class="container">
      <div class="row gy-4">
        <!-- Game Info -->
        <div class="col-md-4 mb-3">
          <div class="d-flex align-items-center mb-3">
            <img
              src="/src/assets/images/logo.png"
              alt="Snake logo"
              style="height: 30px; width: 30px; margin-right: 10px;"
            />
            <span class="h5 mb-0">Snake Game</span>
          </div>
          <p class="text-muted small">
            Experience the classic Snake game reimagined for the modern web. Challenge yourself, compete with friends, and climb the leaderboard!
          </p>
        </div>

        <!-- Quick Links -->
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">Quick Links</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="text-decoration-none text-muted">
                <i class="bi bi-house-door me-2"></i>Home
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/leaderboard" class="text-decoration-none text-muted">
                <i class="bi bi-trophy me-2"></i>Leaderboard
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/about" class="text-decoration-none text-muted">
                <i class="bi bi-info-circle me-2"></i>About
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/my-games" class="text-decoration-none text-muted">
                <i class="bi bi-controller me-2"></i>My Games
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact & Social -->
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">Connect With Us</h5>
          <div class="d-flex gap-3 mb-3">
            <a href="#" class="text-muted text-decoration-none">
              <i class="bi bi-github fs-5"></i>
            </a>
            <a href="#" class="text-muted text-decoration-none">
              <i class="bi bi-twitter fs-5"></i>
            </a>
            <a href="#" class="text-muted text-decoration-none">
              <i class="bi bi-discord fs-5"></i>
            </a>
            <a href="#" class="text-muted text-decoration-none">
              <i class="bi bi-envelope fs-5"></i>
            </a>
          </div>
          <p class="small text-muted mb-0">
            Questions or feedback?
            <a href="mailto:s39907@pansjar.edu.pl" class="text-decoration-none text-primary">
              s39907@pansjar.edu.pl
            </a>
          </p>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-top mt-4 pt-4 text-center text-muted small">
        <p class="mb-0">
          © {{ currentYear }} Snake Game. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
}

.footer a:hover {
  color: #0d6efd !important;
}

.bi {
  line-height: 1;
}
</style>