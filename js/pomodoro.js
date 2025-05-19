document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const timerMinutes = document.querySelector('.timer-minutes');
    const timerSeconds = document.querySelector('.timer-seconds');
    const timerCircle = document.querySelector('.timer-circle-progress');
    const timer3dSpace = document.querySelector('.timer-3d-space');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.pomodoro-mode-btn');
    const completedPomodoros = document.getElementById('completed-pomodoros');
    const totalFocusTime = document.getElementById('total-focus-time');
    const userLevel = document.getElementById('user-level');
    const productivityBar = document.getElementById('productivity-bar');
    const productivityPercentage = document.getElementById('productivity-percentage');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksList = document.getElementById('tasks-list');
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const achievementsGrid = document.getElementById('achievements-grid');
    const failureOverlay = document.getElementById('failure-overlay');
    const confettiContainer = document.getElementById('confetti-container');
    
    // Variables del temporizador
    let timer;
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    let totalSeconds = minutes * 60 + seconds;
    let initialTotalSeconds = totalSeconds;
    let currentMode = 'pomodoro';
    let pomodorosCount = 0;
    let totalFocusMinutes = 0;
    let currentTask = null;
    let taskPomodoros = {};
    let level = 1;
    let xp = 0;
    let xpToNextLevel = 100;
    let productivity = 0;
    let streakCount = 0;
    let failedPomodoros = 0;
    
    // Configuración del círculo SVG
    const circumference = 2 * Math.PI * 45; // 2πr donde r=45
    timerCircle.style.strokeDasharray = circumference;
    timerCircle.style.strokeDashoffset = 0;
    
    // Sonidos
    const tickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-clock-tick-1059.mp3');
    const completeSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    const failSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');
    const levelUpSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    
    // Logros disponibles
    const achievements = [
      { id: 'first-pomodoro', icon: '🍅', name: 'Primer Pomodoro', description: 'Completa tu primer pomodoro', condition: () => pomodorosCount >= 1 },
      { id: 'five-pomodoros', icon: '🔥', name: 'Cinco Pomodoros', description: 'Completa 5 pomodoros', condition: () => pomodorosCount >= 5 },
      { id: 'ten-pomodoros', icon: '⭐', name: 'Diez Pomodoros', description: 'Completa 10 pomodoros', condition: () => pomodorosCount >= 10 },
      { id: 'first-task', icon: '📝', name: 'Primera Tarea', description: 'Completa tu primera tarea', condition: () => getCompletedTasks().length >= 1 },
      { id: 'five-tasks', icon: '📋', name: 'Cinco Tareas', description: 'Completa 5 tareas', condition: () => getCompletedTasks().length >= 5 },
      { id: 'streak-3', icon: '🔄', name: 'Racha x3', description: 'Completa 3 pomodoros seguidos', condition: () => streakCount >= 3 },
      { id: 'one-hour', icon: '⏱️', name: 'Una Hora', description: 'Acumula 60 minutos de enfoque', condition: () => totalFocusMinutes >= 60 },
      { id: 'level-5', icon: '🏆', name: 'Nivel 5', description: 'Alcanza el nivel 5', condition: () => level >= 5 }
    ];
    
    // Inicializar el temporizador y la interfaz
    initializeApp();
    
    // Funciones de inicialización
    function initializeApp() {
      updateTimerDisplay();
      initializeAchievements();
      setupParticles();
      loadData();
      updateProductivityBar();
      updateTasksCount();
      
      // Event Listeners
      startBtn.addEventListener('click', startTimer);
      pauseBtn.addEventListener('click', pauseTimer);
      resetBtn.addEventListener('click', resetTimer);
      
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          setTimerMode(btn.dataset.mode, parseInt(btn.dataset.time));
        });
      });
      
      addTaskBtn.addEventListener('click', addTask);
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addTask();
        }
      });
      
      // Atajos de teclado
      document.addEventListener('keydown', (e) => {
        // Espacio para iniciar/pausar
        if (e.code === 'Space' && document.activeElement !== taskInput) {
          e.preventDefault();
          if (isRunning) {
            pauseTimer();
          } else {
            startTimer();
          }
        }
        
        // R para reiniciar
        if (e.code === 'KeyR' && document.activeElement !== taskInput) {
          resetTimer();
        }
      });
    }
    
    function initializeAchievements() {
      achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement';
        achievementEl.id = `achievement-${achievement.id}`;
        achievementEl.dataset.tooltip = achievement.name;
        achievementEl.innerHTML = achievement.icon;
        
        achievementsGrid.appendChild(achievementEl);
      });
    }
    
    // Funciones del temporizador
    function startTimer() {
      if (!isRunning) {
        isRunning = true;
        document.querySelector('.timer-circle').classList.add('active');
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // Si no hay tarea seleccionada y hay tareas pendientes, seleccionar la primera
        if (!currentTask && getIncompleteTasks().length > 0) {
          currentTask = getIncompleteTasks()[0].id;
          highlightCurrentTask();
        }
        
        // Efecto 3D de rotación al iniciar
        timer3dSpace.classList.add('rotate');
        setTimeout(() => {
          timer3dSpace.classList.remove('rotate');
        }, 2000);
        
        timer = setInterval(() => {
          if (seconds === 0) {
            if (minutes === 0) {
              clearInterval(timer);
              timerComplete();
              return;
            }
            minutes--;
            seconds = 59;
          } else {
            seconds--;
          }
          
          // Reproducir sonido de tick cada 15 segundos
          if (seconds % 15 === 0) {
            tickSound.volume = 0.3;
            tickSound.play();
          }
          
          updateTimerDisplay();
          updateTimerProgress();
        }, 1000);
      }
    }
    
    function pauseTimer() {
      if (isRunning) {
        isRunning = false;
        document.querySelector('.timer-circle').classList.remove('active');
        clearInterval(timer);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
      }
    }
    
    function resetTimer() {
      pauseTimer();
      minutes = parseInt(document.querySelector('.pomodoro-mode-btn.active').dataset.time);
      seconds = 0;
      totalSeconds = minutes * 60;
      initialTotalSeconds = totalSeconds;
      updateTimerDisplay();
      updateTimerProgress();
    }
    
    function updateTimerDisplay() {
      timerMinutes.textContent = minutes.toString().padStart(2, '0');
      timerSeconds.textContent = seconds.toString().padStart(2, '0');
    }
    
    function updateTimerProgress() {
      const currentTotalSeconds = minutes * 60 + seconds;
      const progress = currentTotalSeconds / initialTotalSeconds;
      const offset = circumference - (progress * circumference);
      timerCircle.style.strokeDashoffset = offset;
    }
    
    function setTimerMode(mode, time) {
      // Si estamos cambiando de pomodoro a descanso sin completar, mostrar efecto de fallo
      if (isRunning && currentMode === 'pomodoro' && mode !== 'pomodoro') {
        failSound.play();
        if (window.showFailureEffect) {
          window.showFailureEffect();
        }
      }
      
      pauseTimer();
      currentMode = mode;
      minutes = time;
      seconds = 0;
      totalSeconds = minutes * 60;
      initialTotalSeconds = totalSeconds;
      updateTimerDisplay();
      updateTimerProgress();
      
      // Actualizar botones de modo
      modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
          btn.classList.add('active');
        }
      });
      
      // Cambiar color según el modo
      if (mode === 'pomodoro') {
        timerCircle.style.stroke = 'var(--color-secondary)';
      } else if (mode === 'shortBreak') {
        timerCircle.style.stroke = '#4ECDC4';
      } else {
        timerCircle.style.stroke = '#FF8A65';
      }
      
      // Efecto 3D al cambiar de modo
      timer3dSpace.classList.add('rotate');
      setTimeout(() => {
        timer3dSpace.classList.remove('rotate');
      }, 2000);
    }
    
    function timerComplete() {
      completeSound.play();
      isRunning = false;
      document.querySelector('.timer-circle').classList.remove('active');
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      
      // Actualizar estadísticas si era un pomodoro
      if (currentMode === 'pomodoro') {
        pomodorosCount++;
        totalFocusMinutes += parseInt(document.querySelector('.pomodoro-mode-btn[data-mode="pomodoro"]').dataset.time);
        completedPomodoros.textContent = pomodorosCount;
        totalFocusTime.textContent = `${totalFocusMinutes} min`;
        
        // Actualizar pomodoros para la tarea actual
        if (currentTask) {
          updateTaskPomodoro(currentTask);
        }
        
        // Añadir experiencia
        if (window.addExperience) {
          window.addExperience(25); // 25 puntos de experiencia por pomodoro
        }
        
        // Crear confeti para celebrar
        if (window.createConfetti) {
          window.createConfetti();
        }
        
        // Comprobar logros
        if (window.checkAchievements) {
          window.checkAchievements();
        }
        
        // Cambiar automáticamente al modo de descanso
        if (pomodorosCount % 4 === 0) {
          setTimerMode('longBreak', 15);
        } else {
          setTimerMode('shortBreak', 5);
        }
      } else {
        // Si era un descanso, volver al modo pomodoro
        setTimerMode('pomodoro', 25);
      }
      
      // Mostrar notificación
      showNotification();
      
      // Guardar datos
      saveData();
    }
    
    // Funciones para tareas
    function addTask() {
      const taskText = taskInput.value.trim();
      if (taskText) {
        const taskId = 'task-' + Date.now();
        
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = taskId;
        
        // Inicializar contador de pomodoros para esta tarea
        taskPomodoros[taskId] = 0;
        
        // Contenido de la tarea
        taskItem.innerHTML = `
          <div class="task-content">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${taskText}</span>
          </div>
          <div class="task-pomodoros">
            <div class="pomodoro-count" data-id="${taskId}">
              <div class="pomodoro-dot"></div>
              <div class="pomodoro-dot"></div>
              <div class="pomodoro-dot"></div>
              <div class="pomodoro-dot"></div>
            </div>
          </div>
          <div class="task-actions">
            <button class="task-action-btn task-focus" title="Enfocar en esta tarea">
              <i class="fas fa-bullseye"></i>
            </button>
            <button class="task-action-btn task-delete" title="Eliminar tarea">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        
        // Event listeners para los botones
        taskItem.querySelector('.task-checkbox').addEventListener('change', (e) => {
          const isCompleted = e.target.checked;
          taskItem.classList.toggle('completed', isCompleted);
          updateTasksCount();
          
          if (isCompleted) {
            // Añadir experiencia por completar tarea
            if (window.addExperience) {
              window.addExperience(10); // 10 puntos por completar tarea
            }
            
            // Comprobar logros
            if (window.checkAchievements) {
              window.checkAchievements();
            }
          }
          
          saveData();
        });
        
        taskItem.querySelector('.task-focus').addEventListener('click', () => {
          focusOnTask(taskId);
        });
        
        taskItem.querySelector('.task-delete').addEventListener('click', () => {
          deleteTask(taskItem);
        });
        
        // Añadir con animación
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateY(20px)';
        tasksList.appendChild(taskItem);
        
        // Trigger reflow
        void taskItem.offsetWidth;
        
        // Aplicar animación
        taskItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        taskItem.style.opacity = '1';
        taskItem.style.transform = 'translateY(0)';
        
        // Actualizar contador de tareas
        updateTasksCount();
        
        // Limpiar el input
        taskInput.value = '';
        taskInput.focus();
        
        // Guardar datos
        saveData();
      }
    }
    
    function focusOnTask(taskId) {
      // Quitar highlight de todas las tareas
      document.querySelectorAll('.task-item').forEach(item => {
        item.style.backgroundColor = '';
      });
      
      // Añadir highlight a la tarea actual
      if (taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
          taskItem.style.backgroundColor = 'rgba(126, 203, 192, 0.1)';
        }
      }
      
      currentTask = taskId;
      
      // Si no está en modo pomodoro, cambiar
      if (currentMode !== 'pomodoro') {
        setTimerMode('pomodoro', 25);
      }
    }
  
    function highlightCurrentTask() {
      // Quitar highlight de todas las tareas
      document.querySelectorAll('.task-item').forEach(item => {
        item.style.backgroundColor = '';
      });
  
      // Añadir highlight a la tarea actual
      if (currentTask) {
        const taskItem = document.querySelector(`.task-item[data-id="${currentTask}"]`);
        if (taskItem) {
          taskItem.style.backgroundColor = 'rgba(126, 203, 192, 0.1)';
        }
      }
    }
    
    function updateTaskPomodoro(taskId) {
      const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
      if (taskItem) {
        const pomodoroCountElement = taskItem.querySelector('.pomodoro-count');
        if (pomodoroCountElement) {
          taskPomodoros[taskId] = (taskPomodoros[taskId] || 0) + 1;
          const pomodoroCount = taskPomodoros[taskId];
          
          // Actualizar los dots
          const dots = pomodoroCountElement.querySelectorAll('.pomodoro-dot');
          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < pomodoroCount);
          });
          
          // Si todos los dots están activos, marcar la tarea como completada
          if (pomodoroCount >= 4) {
            const checkbox = taskItem.querySelector('.task-checkbox');
            if (checkbox && !checkbox.checked) {
              checkbox.checked = true;
              taskItem.classList.add('completed');
              updateTasksCount();
              
              // Añadir experiencia por completar tarea
              if (window.addExperience) {
                window.addExperience(15); // Bonus por completar todos los pomodoros
              }
              
              // Comprobar logros
              if (window.checkAchievements) {
                window.checkAchievements();
              }
            }
          }
        }
      }
    }
    
    function deleteTask(taskItem) {
      taskItem.style.opacity = '0';
      taskItem.style.transform = 'translateX(50px)';
      
      setTimeout(() => {
        tasksList.removeChild(taskItem);
        updateTasksCount();
        
        // Si la tarea eliminada era la actual, deseleccionar
        const taskId = taskItem.dataset.id;
        if (currentTask === taskId) {
          currentTask = null;
        }
        
        saveData();
      }, 300);
    }
    
    function getIncompleteTasks() {
      return Array.from(document.querySelectorAll('.task-item:not(.completed)'));
    }
    
    function getCompletedTasks() {
      return Array.from(document.querySelectorAll('.task-item.completed'));
    }
    
    function updateTasksCount() {
      const totalTasks = document.querySelectorAll('.task-item').length;
      const completedTasks = document.querySelectorAll('.task-item.completed').length;
      
      totalTasksElement.textContent = totalTasks;
      completedTasksElement.textContent = completedTasks;
      
      // Actualizar barra de productividad
      if (window.updateProductivityBar) {
        window.updateProductivityBar();
      }
    }
    
    // Sistema de XP y niveles
    function addXP(amount) {
      xp += amount;
      
      // Verificar si sube de nivel
      if (xp >= xpToNextLevel) {
        levelUp();
      }
      
      updateProductivityBar();
    }
    
    function levelUp() {
      level++;
      xp = xp - xpToNextLevel;
      xpToNextLevel = Math.round(xpToNextLevel * 1.5);
      
      userLevel.textContent = level;
      
      // Mostrar animación de subida de nivel
      showLevelUpAnimation();
      
      // Sonido de subida de nivel
      levelUpSound.volume = 0.5;
      levelUpSound.play();
      
      // Verificar logros
      checkAchievements();
    }
    
    function updateProductivityBar() {
      // Calcular porcentaje de XP para el siguiente nivel
      const xpPercentage = Math.min(100, Math.round((xp / xpToNextLevel) * 100));
      productivityBar.style.width = `${xpPercentage}%`;
      productivityPercentage.textContent = `${xpPercentage}%`;
    }
    
    // Sistema de logros
    function checkAchievements() {
      achievements.forEach(achievement => {
        const achievementEl = document.getElementById(`achievement-${achievement.id}`);
        
        if (achievement.condition() && !achievementEl.classList.contains('unlocked')) {
          // Desbloquear logro
          achievementEl.classList.add('unlocked');
          
          // Mostrar notificación
          showAchievementNotification(achievement);
          
          // Añadir XP por logro
          addXP(20);
        }
      });
    }
    
    // Notificaciones
    function showNotification() {
      // Crear notificación
      const notification = document.createElement('div');
      notification.className = 'pomodoro-notification';
      
      let message, icon, title;
      if (currentMode === 'pomodoro') {
        title = '¡Pomodoro completado!';
        message = 'Es hora de tomar un descanso. ¡Buen trabajo!';
        icon = '<i class="fas fa-check-circle notification-icon"></i>';
      } else if (currentMode === 'shortBreak') {
        title = 'Descanso terminado';
        message = 'Vuelve al trabajo. ¡Mantén el ritmo!';
        icon = '<i class="fas fa-brain notification-icon"></i>';
      } else {
        title = 'Descanso largo terminado';
        message = 'Vuelve al trabajo con energía renovada.';
        icon = '<i class="fas fa-brain notification-icon"></i>';
      }
      
      notification.innerHTML = `
        ${icon}
        <div class="notification-content">
          <div class="notification-title">${title}</div>
          <div>${message}</div>
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
      
      // Intentar mostrar notificación del navegador
      if (Notification.permission === 'granted') {
        const notif = new Notification('Dualmind Pomodoro', {
          body: message,
          icon: 'img/favicon.png'
        });
        
        setTimeout(() => notif.close(), 5000);
      }
    }
    
    function showAchievementNotification(achievement) {
      const notification = document.createElement('div');
      notification.className = 'pomodoro-notification';
      
      notification.innerHTML = `
        <div class="notification-icon">${achievement.icon}</div>
        <div class="notification-content">
          <div class="notification-title">¡Logro desbloqueado!</div>
          <div>${achievement.name}: ${achievement.description}</div>
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
    
    function showLevelUpAnimation() {
      const levelUpEl = document.createElement('div');
      levelUpEl.className = 'level-up';
      levelUpEl.innerHTML = `
        <div class="level-up-icon"><i class="fas fa-arrow-up"></i></div>
        <div class="level-up-title">¡Nivel ${level}!</div>
        <p>Has subido de nivel. ¡Sigue así!</p>
      `;
      
      document.body.appendChild(levelUpEl);
      
      // Eliminar después de la animación
      setTimeout(() => {
        levelUpEl.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(levelUpEl)) {
            document.body.removeChild(levelUpEl);
          }
        }, 500);
      }, 3000);
    }
    
    // Efectos visuales
    function createConfetti() {
      const colors = ['#7ecbc0', '#f5e9d1', '#ff8a65', '#64b5f6', '#81c784'];
      
      for (let i = 0; i < 150; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.width = Math.random() * 10 + 5 + 'px';
          confetti.style.height = Math.random() * 10 + 5 + 'px';
          confetti.style.opacity = Math.random();
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
          
          // Añadir animación
          confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s ease-in-out forwards`;
          
          confettiContainer.appendChild(confetti);
          
          // Eliminar después de la animación
          setTimeout(() => {
            if (confettiContainer.contains(confetti)) {
              confettiContainer.removeChild(confetti);
            }
          }, 4000);
        }, Math.random() * 500);
      }
    }
    
    function createMiniConfetti(element) {
      const rect = element.getBoundingClientRect();
      const colors = ['#7ecbc0', '#f5e9d1', '#ff8a65'];
      
      for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = (rect.left + Math.random() * rect.width) + 'px';
        confetti.style.top = (rect.top + Math.random() * rect.height) + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 6 + 2 + 'px';
        confetti.style.height = Math.random() * 6 + 2 + 'px';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Añadir animación
        confetti.style.animation = `confetti-fall ${Math.random() * 1 + 1}s ease-in-out forwards`;
        
        confettiContainer.appendChild(confetti);
        
        // Eliminar después de la animación
        setTimeout(() => {
          if (confettiContainer.contains(confetti)) {
            confettiContainer.removeChild(confetti);
          }
        }, 2000);
      }
    }
    
    function setupParticles() {
      // No implementation provided in the updates
    }
    
    // Solicitar permiso para notificaciones
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      document.querySelector('.pomodoro-title').addEventListener('click', () => {
        Notification.requestPermission();
      });
    }
    
    // Guardar y cargar datos del localStorage
    function saveData() {
      const data = {
        pomodorosCount,
        totalFocusMinutes,
        level,
        xp,
        xpToNextLevel,
        currentTask,
        taskPomodoros,
        tasks: Array.from(tasksList.children).map(task => ({
          id: task.dataset.id,
          text: task.querySelector('.task-text').textContent,
          completed: task.classList.contains('completed'),
          pomodoros: parseInt(task.querySelector('.pomodoro-count').dataset.count) || 0
        }))
      };
      
      localStorage.setItem('dualmindPomodoro', JSON.stringify(data));
    }
    
    function loadData() {
      const savedData = localStorage.getItem('dualmindPomodoro');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        pomodorosCount = data.pomodorosCount || 0;
        totalFocusMinutes = data.totalFocusMinutes || 0;
        level = data.level || 1;
        xp = data.xp || 0;
        xpToNextLevel = data.xpToNextLevel || 100;
        currentTask = data.currentTask || null;
        taskPomodoros = data.taskPomodoros || {};
        
        completedPomodoros.textContent = pomodorosCount;
        totalFocusTime.textContent = `${totalFocusMinutes} min`;
        userLevel.textContent = level;
        
        updateProductivityBar();
        
        // Cargar tareas
        if (data.tasks && data.tasks.length > 0) {
          data.tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            if (task.completed) {
              taskItem.classList.add('completed');
            }
            
            taskItem.innerHTML = `
              <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
              </div>
              <div class="task-pomodoros">
                <div class="pomodoro-count" data-count="${task.pomodoros || 0}">
                  <div class="pomodoro-dot ${task.pomodoros > 0 ? 'active' : ''}"></div>
                  <div class="pomodoro-dot ${task.pomodoros > 1 ? 'active' : ''}"></div>
                  <div class="pomodoro-dot ${task.pomodoros > 2 ? 'active' : ''}"></div>
                  <div class="pomodoro-dot ${task.pomodoros > 3 ? 'active' : ''}"></div>
                </div>
              </div>
              <div class="task-actions">
                <button class="task-action-btn task-focus" title="Enfocar en esta tarea">
                  <i class="fas fa-bullseye"></i>
                </button>
                <button class="task-action-btn task-delete" title="Eliminar tarea">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            `;
            
            tasksList.appendChild(taskItem);
            
            // Añadir event listeners
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => {
              taskItem.classList.toggle('completed', checkbox.checked);
              updateTasksCount();
              checkAchievements();
              saveData();
              
              if (checkbox.checked) {
                // Añadir XP por completar tarea
                addXP(10);
                // Pequeña celebración
                createMiniConfetti(taskItem);
              }
            });
            
            const deleteBtn = taskItem.querySelector('.task-delete');
            deleteBtn.addEventListener('click', () => {
              taskItem.style.opacity = '0';
              taskItem.style.transform = 'translateX(50px)';
              
              setTimeout(() => {
                tasksList.removeChild(taskItem);
                updateTasksCount();
                saveData();
                
                // Si la tarea eliminada era la actual, deseleccionar
                if (currentTask === task.id) {
                  currentTask = null;
                }
              }, 300);
            });
            
            const focusBtn = taskItem.querySelector('.task-focus');
            focusBtn.addEventListener('click', () => {
              currentTask = task.id;
              highlightCurrentTask();
              
              // Si no está en modo pomodoro, cambiar
              if (currentMode !== 'pomodoro') {
                setTimerMode('pomodoro', 25);
              }
            });
          });
        }
        
        highlightCurrentTask();
        updateTasksCount();
        checkAchievements();
      }
    }
    
    // Guardar datos cuando se completa un pomodoro o se modifica una tarea
    setInterval(saveData, 30000); // Guardar cada 30 segundos
    
    // Cargar datos al iniciar
    loadData();
  });