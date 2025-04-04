<template>
  <div class="space"></div>
    <div class="container py-4">
      <div class="row justify-content-center mt-5">
        <div class="col-lg-8 mt-5">
          <div class="card shadow-sm mt-5">
            <div class="card-body p-4">
              <h2 class="h3 mb-4">About Snake Game</h2>
              
              <div class="mb-5">
                <h3 class="h5 mb-3">🎮 The Game</h3>
                <p>Welcome to Snake Game, a modern take on the classic Nokia phone game that captivated millions. Our version brings the nostalgic gameplay to your web browser with updated graphics and features.</p>
              </div>
  
              <div class="mb-5">
                <h3 class="h5 mb-3">✨ Features</h3>
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-trophy text-primary fs-4 me-3"></i>
                      <div>
                        <h4 class="h6">Leaderboard</h4>
                        <p class="text-muted small">Compete with players worldwide and climb the rankings.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-graph-up text-primary fs-4 me-3"></i>
                      <div>
                        <h4 class="h6">Progress Tracking</h4>
                        <p class="text-muted small">Monitor your improvement with detailed game statistics.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-gear text-primary fs-4 me-3"></i>
                      <div>
                        <h4 class="h6">Customization</h4>
                        <p class="text-muted small">Personalize your gaming experience with various options.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-cloud text-primary fs-4 me-3"></i>
                      <div>
                        <h4 class="h6">Cloud Saves</h4>
                        <p class="text-muted small">Your progress is automatically saved and synced.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="mb-5">
                <h3 class="h5 mb-3">🎯 How to Play</h3>
                <p>Use arrow keys to control the snake's direction. Collect food to grow longer, but avoid hitting yourself. The longer you get, the higher your score!</p>
              </div>
  
              <div class="mb-4">
                <h3 class="h5 mb-3">👥 Meet the Team</h3>
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="card h-100 border-0 bg-light">
                      <div class="card-body">
                        <h4 class="h6">Game Development</h4>
                        <p class="text-muted small mb-0">Created by passionate developers who love classic games.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card h-100 border-0 bg-light">
                      <div class="card-body">
                        <h4 class="h6">Support</h4>
                        <p class="text-muted small mb-0">Our team is here to help you with any questions or issues.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="text-center pt-3">
                <router-link to="/" class="btn btn-primary">
                  Start Playing
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AboutView'
  };
  </script>
  
  <style scoped>
  .card {
    border-radius: 1rem;
  }
  
  .bi {
    line-height: 1;
  }

  .space{
    margin-top: 300px;
  }
  </style>