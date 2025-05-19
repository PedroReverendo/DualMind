document.addEventListener('DOMContentLoaded', () => {
    // Inicializar canvas para partículas
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Configuración de partículas
    const particlesArray = [];
    const numberOfParticles = 50;
    
    // Clase Partícula
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(126, 203, 192, ${Math.random() * 0.3})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Rebote en los bordes
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Inicializar partículas
    function initParticles() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    // Animar partículas
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Conectar partículas cercanas
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(126, 203, 192, ${0.1 - distance/1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateParticles);
    }
    
    // Iniciar animación de partículas
    initParticles();
    animateParticles();
    
    // Sistema de confeti mejorado
    const confettiContainer = document.getElementById('confetti-container');
    
    function createConfetti() {
      confettiContainer.innerHTML = ''; // Limpiar confeti anterior
      
      const colors = [
        '#7ecbc0', // Verde menta
        '#f5e9d1', // Beige
        '#ff8a65', // Naranja
        '#64b5f6', // Azul claro
        '#81c784', // Verde claro
        '#ba68c8'  // Púrpura
      ];
      
      const confettiCount = 200;
      const gravity = 0.5;
      const terminalVelocity = 5;
      const drag = 0.075;
      
      class ConfettiPiece {
        constructor() {
          this.x = Math.random() * window.innerWidth;
          this.y = Math.random() * -100 - 100;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = Math.random() * 10 - 5;
          this.velocity = {
            x: Math.random() * 6 - 3,
            y: Math.random() * -3 - 3
          };
          this.width = Math.random() * 10 + 5;
          this.height = Math.random() * 10 + 5;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
          this.element = document.createElement('div');
          this.element.style.position = 'absolute';
          this.element.style.width = `${this.width}px`;
          this.element.style.height = `${this.height}px`;
          this.element.style.backgroundColor = this.color;
          this.element.style.borderRadius = this.shape === 'circle' ? '50%' : '0';
          this.element.style.top = `${this.y}px`;
          this.element.style.left = `${this.x}px`;
          this.element.style.transform = `rotate(${this.rotation}deg)`;
          confettiContainer.appendChild(this.element);
        }
        
        update() {
          this.velocity.y += gravity;
          
          if (this.velocity.y > terminalVelocity) {
            this.velocity.y = terminalVelocity;
          }
          
          this.velocity.x *= (1 - drag);
          
          this.x += this.velocity.x;
          this.y += this.velocity.y;
          this.rotation += this.rotationSpeed;
          
          if (this.y > window.innerHeight || this.x < -100 || this.x > window.innerWidth + 100) {
            this.element.remove();
            return false;
          }
          
          this.element.style.top = `${this.y}px`;
          this.element.style.left = `${this.x}px`;
          this.element.style.transform = `rotate(${this.rotation}deg)`;
          
          return true;
        }
      }
      
      const confettiPieces = [];
      
      for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push(new ConfettiPiece());
      }
      
      function updateConfetti() {
        if (confettiPieces.length === 0) return;
        
        const stillActive = confettiPieces.filter(piece => piece.update());
        
        if (stillActive.length > 0) {
          requestAnimationFrame(updateConfetti);
        }
      }
      
      updateConfetti();
    }
    
    // Exponer la función para que pueda ser llamada desde pomodoro.js
    window.createConfetti = createConfetti;
    
    // Efecto de fallo cuando se abandona un pomodoro
    const failureOverlay = document.getElementById('failure-overlay');
    
    function showFailureEffect() {
      failureOverlay.classList.add('active');
      
      // Efecto de sacudida
      document.body.style.animation = 'shake 0.5s ease-in-out';
      
      setTimeout(() => {
        failureOverlay.classList.remove('active');
        document.body.style.animation = '';
      }, 500);
    }
    
    window.showFailureEffect = showFailureEffect;
    
    // Efecto de subida de nivel
    function showLevelUp(level) {
      const levelUpElement = document.createElement('div');
      levelUpElement.className = 'level-up';
      levelUpElement.innerHTML = `
        <div class="level-up-icon"><i class="fas fa-trophy"></i></div>
        <h2 class="level-up-title">¡Nivel ${level} Alcanzado!</h2>
        <p>Has desbloqueado nuevas habilidades y logros.</p>
      `;
      
      document.body.appendChild(levelUpElement);
      
      // Reproducir sonido de nivel
      const levelUpSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
      levelUpSound.play();
      
      // Crear confeti especial
      createConfetti();
      
      // Eliminar después de la animación
      setTimeout(() => {
        levelUpElement.style.opacity = '0';
        levelUpElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        levelUpElement.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
          document.body.removeChild(levelUpElement);
        }, 500);
      }, 3000);
    }
    
    window.showLevelUp = showLevelUp;
    
    // Efecto 3D para el timer
    const timer3dSpace = document.querySelector('.timer-3d-space');
    
    function applyRotation(event) {
      if (!timer3dSpace) return;
      
      const rect = timer3dSpace.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      const angleX = (mouseY - centerY) / 20;
      const angleY = (centerX - mouseX) / 20;
      
      timer3dSpace.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    }
    
    document.addEventListener('mousemove', applyRotation);
    
    // Resetear rotación cuando el mouse sale del área
    document.addEventListener('mouseleave', () => {
      if (timer3dSpace) {
        timer3dSpace.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    });
    
    // Declarar variables
    let pomodorosCount = 0;
    let totalFocusMinutes = 0;
  
    // Sistema de logros
    const achievements = [
      { id: 'first-pomodoro', icon: 'fa-play', title: 'Primer Pomodoro', description: 'Completaste tu primer pomodoro', requirement: () => pomodorosCount >= 1 },
      { id: 'five-pomodoros', icon: 'fa-fire', title: 'En Racha', description: 'Completaste 5 pomodoros', requirement: () => pomodorosCount >= 5 },
      { id: 'ten-pomodoros', icon: 'fa-fire-flame-curved', title: 'Imparable', description: 'Completaste 10 pomodoros', requirement: () => pomodorosCount >= 10 },
      { id: 'complete-task', icon: 'fa-check', title: 'Tarea Completada', description: 'Completaste tu primera tarea', requirement: () => document.querySelectorAll('.task-item.completed').length >= 1 },
      { id: 'five-tasks', icon: 'fa-list-check', title: 'Organizador', description: 'Completaste 5 tareas', requirement: () => document.querySelectorAll('.task-item.completed').length >= 5 },
      { id: 'one-hour', icon: 'fa-hourglass-half', title: 'Una Hora Enfocada', description: 'Acumulaste una hora de enfoque', requirement: () => totalFocusMinutes >= 60 },
      { id: 'two-hours', icon: 'fa-hourglass', title: 'Dos Horas Enfocadas', description: 'Acumulaste dos horas de enfoque', requirement: () => totalFocusMinutes >= 120 },
      { id: 'night-owl', icon: 'fa-moon', title: 'Búho Nocturno', description: 'Trabajaste después de las 10 PM', requirement: () => new Date().getHours() >= 22 }
    ];
    
    function initAchievements() {
      const achievementsGrid = document.getElementById('achievements-grid');
      
      achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        achievementElement.dataset.tooltip = achievement.title;
        achievementElement.dataset.id = achievement.id;
        achievementElement.innerHTML = `<i class="fas ${achievement.icon}"></i>`;
        
        // Comprobar si ya está desbloqueado
        if (isAchievementUnlocked(achievement.id)) {
          achievementElement.classList.add('unlocked');
        }
        
        achievementElement.addEventListener('click', () => {
          showAchievementDetails(achievement);
        });
        
        achievementsGrid.appendChild(achievementElement);
      });
    }
    
    function checkAchievements() {
      achievements.forEach(achievement => {
        if (!isAchievementUnlocked(achievement.id) && achievement.requirement()) {
          unlockAchievement(achievement);
        }
      });
    }
    
    function unlockAchievement(achievement) {
      // Marcar como desbloqueado
      const unlockedAchievements = JSON.parse(localStorage.getItem('dualmindAchievements') || '[]');
      if (!unlockedAchievements.includes(achievement.id)) {
        unlockedAchievements.push(achievement.id);
        localStorage.setItem('dualmindAchievements', JSON.stringify(unlockedAchievements));
        
        // Actualizar UI
        const achievementElement = document.querySelector(`.achievement[data-id="${achievement.id}"]`);
        if (achievementElement) {
          achievementElement.classList.add('unlocked');
        }
        
        // Mostrar notificación
        showAchievementNotification(achievement);
      }
    }
    
    function isAchievementUnlocked(id) {
      const unlockedAchievements = JSON.parse(localStorage.getItem('dualmindAchievements') || '[]');
      return unlockedAchievements.includes(id);
    }
    
    function showAchievementNotification(achievement) {
      const notification = document.createElement('div');
      notification.className = 'pomodoro-notification achievement-notification';
      notification.innerHTML = `
        <div class="notification-icon"><i class="fas ${achievement.icon}"></i></div>
        <div class="notification-content">
          <div class="notification-title">¡Logro Desbloqueado!</div>
          <div>${achievement.title}: ${achievement.description}</div>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
      `;
      
      document.body.appendChild(notification);
      
      // Mostrar con animación
      setTimeout(() => {
        notification.classList.add('show');
      }, 100);
      
      // Cerrar al hacer clic
      notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      });
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.classList.remove('show');
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 500);
        }
      }, 5000);
    }
    
    function showAchievementDetails(achievement) {
      const detailsElement = document.createElement('div');
      detailsElement.className = 'achievement-details';
      detailsElement.innerHTML = `
        <div class="achievement-details-icon"><i class="fas ${achievement.icon}"></i></div>
        <h3>${achievement.title}</h3>
        <p>${achievement.description}</p>
        <div class="achievement-status">
          ${isAchievementUnlocked(achievement.id) ? 
            '<span class="status-unlocked"><i class="fas fa-check-circle"></i> Desbloqueado</span>' : 
            '<span class="status-locked"><i class="fas fa-lock"></i> Bloqueado</span>'}
        </div>
        <button class="close-details">Cerrar</button>
      `;
      
      document.body.appendChild(detailsElement);
      
      // Mostrar con animación
      setTimeout(() => {
        detailsElement.style.opacity = '1';
        detailsElement.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 10);
      
      // Cerrar al hacer clic en el botón
      detailsElement.querySelector('.close-details').addEventListener('click', () => {
        detailsElement.style.opacity = '0';
        detailsElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
          document.body.removeChild(detailsElement);
        }, 300);
      });
    }
    
    // Sistema de niveles
    const userLevelElement = document.getElementById('user-level');
    const productivityBar = document.getElementById('productivity-bar');
    const productivityPercentage = document.getElementById('productivity-percentage');
    
    let userLevel = 1;
    let userExperience = 0;
    const experienceToNextLevel = () => userLevel * 100;
    
    function initUserLevel() {
      const savedLevel = localStorage.getItem('dualmindUserLevel');
      const savedExperience = localStorage.getItem('dualmindUserExperience');
      
      if (savedLevel && savedExperience) {
        userLevel = parseInt(savedLevel);
        userExperience = parseInt(savedExperience);
        
        updateLevelUI();
      }
    }
    
    function addExperience(amount) {
      userExperience += amount;
      
      const nextLevelExp = experienceToNextLevel();
      
      if (userExperience >= nextLevelExp) {
        userExperience -= nextLevelExp;
        userLevel++;
        
        // Mostrar animación de subida de nivel
        showLevelUp(userLevel);
      }
      
      updateLevelUI();
      saveLevelData();
    }
    
    function updateLevelUI() {
      userLevelElement.textContent = userLevel;
      
      const nextLevelExp = experienceToNextLevel();
      const percentage = Math.min(100, Math.floor((userExperience / nextLevelExp) * 100));
      
      productivityBar.style.width = `${percentage}%`;
      productivityPercentage.textContent = `${percentage}%`;
    }
    
    function saveLevelData() {
      localStorage.setItem('dualmindUserLevel', userLevel);
      localStorage.setItem('dualmindUserExperience', userExperience);
    }
    
    // Inicializar sistemas
    initAchievements();
    initUserLevel();
    
    // Comprobar logros periódicamente
    setInterval(checkAchievements, 5000);
    
    // Exponer funciones para que puedan ser llamadas desde pomodoro.js
    window.addExperience = addExperience;
    window.checkAchievements = checkAchievements;
  });