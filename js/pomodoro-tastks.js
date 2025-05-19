document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksList = document.getElementById('tasks-list');
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    
    // Variables para tareas
    let tasks = [];
    let taskIdCounter = 0;
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
    
    // Funciones para tareas
    function addTask() {
      const taskText = taskInput.value.trim();
      if (taskText) {
        const taskId = taskIdCounter++;
        const task = {
          id: taskId,
          text: taskText,
          completed: false,
          pomodoros: 0,
          estimatedPomodoros: 1
        };
        
        tasks.push(task);
        renderTask(task);
        updateTasksCounter();
        
        // Limpiar el input
        taskInput.value = '';
        taskInput.focus();
        
        // Guardar tareas
        saveTasks();
        
        // Añadir experiencia por crear una tarea
        if (window.addExperience) {
          window.addExperience(5);
        }
      }
    }
    
    function renderTask(task) {
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.dataset.id = task.id;
      if (task.completed) {
        taskItem.classList.add('completed');
      }
      
      // Contenido de la tarea (checkbox + texto)
      const taskContent = document.createElement('div');
      taskContent.className = 'task-content';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        toggleTaskCompletion(task.id, checkbox.checked);
      });
      
      const taskTextSpan = document.createElement('span');
      taskTextSpan.className = 'task-text';
      taskTextSpan.textContent = task.text;
      
      taskContent.appendChild(checkbox);
      taskContent.appendChild(taskTextSpan);
      
      // Pomodoros de la tarea
      const taskPomodoros = document.createElement('div');
      taskPomodoros.className = 'task-pomodoros';
      
      const pomodoroCount = document.createElement('div');
      pomodoroCount.className = 'pomodoro-count';
      
      // Crear puntos de pomodoro
      for (let i = 0; i < task.estimatedPomodoros; i++) {
        const pomodoroDot = document.createElement('div');
        pomodoroDot.className = 'pomodoro-dot';
        if (i < task.pomodoros) {
          pomodoroDot.classList.add('active');
        }
        pomodoroCount.appendChild(pomodoroDot);
      }
      
      const pomodoroControls = document.createElement('div');
      pomodoroControls.className = 'pomodoro-controls';
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.className = 'pomodoro-control-btn';
      decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
      decreaseBtn.addEventListener('click', () => {
        if (task.estimatedPomodoros > 1) {
          task.estimatedPomodoros--;
          updateTaskUI(task);
          saveTasks();
        }
      });
      
      const increaseBtn = document.createElement('button');
      increaseBtn.className = 'pomodoro-control-btn';
      increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
      increaseBtn.addEventListener('click', () => {
        if (task.estimatedPomodoros < 5) {
          task.estimatedPomodoros++;
          updateTaskUI(task);
          saveTasks();
        }
      });
      
      pomodoroControls.appendChild(decreaseBtn);
      pomodoroControls.appendChild(increaseBtn);
      
      taskPomodoros.appendChild(pomodoroCount);
      taskPomodoros.appendChild(pomodoroControls);
      
      // Acciones de la tarea
      const taskActions = document.createElement('div');
      taskActions.className = 'task-actions';
      
      const startBtn = document.createElement('button');
      startBtn.className = 'task-action-btn';
      startBtn.innerHTML = '<i class="fas fa-play"></i>';
      startBtn.title = 'Iniciar Pomodoro para esta tarea';
      startBtn.addEventListener('click', () => {
        setActiveTask(task.id);
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-action-btn task-delete';
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.title = 'Eliminar tarea';
      deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
      });
      
      taskActions.appendChild(startBtn);
      taskActions.appendChild(deleteBtn);
      
      // Añadir todo al elemento de tarea
      taskItem.appendChild(taskContent);
      taskItem.appendChild(taskPomodoros);
      taskItem.appendChild(taskActions);
      
      // Añadir al DOM con animación
      taskItem.style.opacity = '0';
      taskItem.style.transform = 'translateY(20px)';
      tasksList.appendChild(taskItem);
      
      // Trigger reflow
      void taskItem.offsetWidth;
      
      // Aplicar animación
      taskItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      taskItem.style.opacity = '1';
      taskItem.style.transform = 'translateY(0)';
    }
    
    function updateTaskUI(task) {
      const taskItem = document.querySelector(`.task-item[data-id="${task.id}"]`);
      if (!taskItem) return;
      
      // Actualizar estado completado
      taskItem.classList.toggle('completed', task.completed);
      const checkbox = taskItem.querySelector('.task-checkbox');
      if (checkbox) {
        checkbox.checked = task.completed;
      }
      
      // Actualizar pomodoros
      const pomodoroCount = taskItem.querySelector('.pomodoro-count');
      if (pomodoroCount) {
        pomodoroCount.innerHTML = '';
        
        for (let i = 0; i < task.estimatedPomodoros; i++) {
          const pomodoroDot = document.createElement('div');
          pomodoroDot.className = 'pomodoro-dot';
          if (i < task.pomodoros) {
            pomodoroDot.classList.add('active');
          }
          pomodoroCount.appendChild(pomodoroDot);
        }
      }
    }
    
    function toggleTaskCompletion(taskId, completed) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = completed;
        
        // Si se completa, añadir experiencia
        if (completed && window.addExperience) {
          window.addExperience(20);
          
          // Efecto de confeti pequeño
          if (window.createConfetti) {
            window.createConfetti();
          }
        }
        
        updateTasksCounter();
        saveTasks();
        
        // Comprobar logros
        if (window.checkAchievements) {
          window.checkAchievements();
        }
      }
    }
    
    function deleteTask(taskId) {
      const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
      if (taskItem) {
        // Animación de salida
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
          tasksList.removeChild(taskItem);
          
          // Eliminar de la lista de tareas
          tasks = tasks.filter(t => t.id !== taskId);
          updateTasksCounter();
          saveTasks();
        }, 300);
      }
    }
    
    // Declarar startPomodoroForTask antes de usarla
    let startPomodoroForTask;
  
    function setActiveTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Resaltar la tarea activa
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
          item.classList.remove('active-task');
        });
        
        const activeTaskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (activeTaskItem) {
          activeTaskItem.classList.add('active-task');
        }
        
        // Iniciar pomodoro para esta tarea
        if (typeof startPomodoroForTask === 'function') {
          startPomodoroForTask(task);
        }
      }
    }
    
    function completePomodoro(taskId) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].pomodoros++;
        
        // Si se completan todos los pomodoros estimados, marcar como completada
        if (tasks[taskIndex].pomodoros >= tasks[taskIndex].estimatedPomodoros) {
          tasks[taskIndex].completed = true;
        }
        
        updateTaskUI(tasks[taskIndex]);
        updateTasksCounter();
        saveTasks();
        
        // Añadir experiencia
        if (window.addExperience) {
          window.addExperience(25);
        }
      }
    }
    
    function updateTasksCounter() {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      
      totalTasksElement.textContent = totalTasks;
      completedTasksElement.textContent = completedTasks;
    }
    
    // Guardar y cargar tareas
    function saveTasks() {
      localStorage.setItem('dualmindTasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
      const savedTasks = localStorage.getItem('dualmindTasks');
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        
        // Encontrar el mayor ID para continuar la secuencia
        if (tasks.length > 0) {
          taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
        }
        
        // Renderizar tareas
        tasksList.innerHTML = '';
        tasks.forEach(task => {
          renderTask(task);
        });
        
        updateTasksCounter();
      }
    }
    
    // Inicializar
    loadTasks();
    
    // Exponer funciones para que puedan ser llamadas desde otros scripts
    window.completePomodoro = completePomodoro;
    window.setActiveTask = setActiveTask;
  });