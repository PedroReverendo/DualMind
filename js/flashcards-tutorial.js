/**
 * Tutorial interactivo para Flashcards
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el tutorial
    initTutorial();
    
    // Configurar eventos para el tutorial
    setupTutorialEvents();
  });
  
  // Datos del tutorial
  const tutorialSteps = [
    {
      title: "Bienvenido a Flashcards",
      content: `
        <div class="tutorial-step-content">
          <p>¡Bienvenido al sistema de flashcards de Dualmind! Esta herramienta te ayudará a estudiar y memorizar información de manera efectiva utilizando técnicas de repetición espaciada y gamificación.</p>
          <p>Este breve tutorial te mostrará cómo usar todas las funciones. ¡Vamos a empezar!</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Bienvenida a Flashcards" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "Creando tu primer mazo",
      content: `
        <div class="tutorial-step-content">
          <p>Para comenzar, crea un nuevo mazo de flashcards haciendo clic en el botón <strong>"Nuevo Mazo"</strong>.</p>
          <p>Cada mazo puede representar un tema o asignatura que quieras estudiar. Por ejemplo: "Vocabulario de Inglés", "Anatomía Humana" o "Fórmulas de Física".</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Creando un mazo" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "Añadiendo flashcards",
      content: `
        <div class="tutorial-step-content">
          <p>Una vez creado tu mazo, puedes añadir flashcards haciendo clic en <strong>"Añadir Flashcard"</strong>.</p>
          <p>Cada flashcard tiene dos caras:</p>
          <ul>
            <li><strong>Frente:</strong> La pregunta o concepto que quieres aprender</li>
            <li><strong>Reverso:</strong> La respuesta o explicación</li>
          </ul>
          <p>Puedes incluir texto, imágenes o incluso audio en tus flashcards.</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Añadiendo flashcards" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "Estudiando con flashcards",
      content: `
        <div class="tutorial-step-content">
          <p>Para estudiar, selecciona un mazo y haz clic en <strong>"Estudiar"</strong>.</p>
          <p>El sistema te mostrará las flashcards una por una. Intenta recordar la respuesta y luego voltea la tarjeta para comprobar.</p>
          <p>Después de ver la respuesta, evalúa qué tan bien la conocías. Esto ayuda al sistema a determinar cuándo mostrarte esa tarjeta nuevamente.</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Estudiando con flashcards" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "Sistema de repetición espaciada",
      content: `
        <div class="tutorial-step-content">
          <p>Dualmind utiliza un <strong>algoritmo de repetición espaciada</strong> para optimizar tu aprendizaje.</p>
          <p>Las tarjetas que te resulten difíciles aparecerán con más frecuencia, mientras que las que ya dominas se mostrarán con menos frecuencia.</p>
          <p>Este método científicamente probado mejora la retención a largo plazo y hace tu estudio más eficiente.</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Sistema de repetición espaciada" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "Gamificación y recompensas",
      content: `
        <div class="tutorial-step-content">
          <p>¡Estudiar con Dualmind es divertido! Ganarás puntos de experiencia (XP) por:</p>
          <ul>
            <li>Crear nuevos mazos y flashcards</li>
            <li>Completar sesiones de estudio</li>
            <li>Dominar tarjetas difíciles</li>
            <li>Mantener rachas de estudio diario</li>
          </ul>
          <p>Sube de nivel y desbloquea logros mientras mejoras tus conocimientos.</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Gamificación y recompensas" class="tutorial-image">
          </div>
        </div>
      `
    },
    {
      title: "¡Listo para empezar!",
      content: `
        <div class="tutorial-step-content">
          <p>¡Ya estás listo para comenzar a usar Flashcards de Dualmind!</p>
          <p>Recuerda que puedes acceder a este tutorial en cualquier momento desde el menú de ayuda.</p>
          <p>¡Feliz aprendizaje!</p>
          <div class="tutorial-image-container">
            <img src="/placeholder.svg?height=200&width=400" alt="Listo para empezar" class="tutorial-image">
          </div>
        </div>
      `
    }
  ];
  
  /**
   * Inicializa el tutorial
   */
  function initTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tutorialContent = document.getElementById('tutorial-content');
    const tutorialDots = document.getElementById('tutorial-dots');
    
    if (!tutorialOverlay || !tutorialContent || !tutorialDots) return;
    
    // Crear pasos del tutorial
    tutorialSteps.forEach((step, index) => {
      // Crear contenido del paso
      const stepElement = document.createElement('div');
      stepElement.className = `tutorial-step ${index === 0 ? 'active' : ''}`;
      stepElement.innerHTML = `
        <h3>${step.title}</h3>
        ${step.content}
      `;
      tutorialContent.appendChild(stepElement);
      
      // Crear punto indicador
      const dot = document.createElement('div');
      dot.className = `tutorial-dot ${index === 0 ? 'active' : ''}`;
      dot.dataset.step = index;
      tutorialDots.appendChild(dot);
      
      // Añadir evento al punto
      dot.addEventListener('click', () => {
        goToTutorialStep(index);
      });
    });
    
    // Verificar si es la primera vez que el usuario visita la página
    const tutorialShown = localStorage.getItem('dualmindFlashcardsTutorialShown');
    
    if (!tutorialShown) {
      // Mostrar tutorial automáticamente la primera vez
      setTimeout(() => {
        showTutorial();
        localStorage.setItem('dualmindFlashcardsTutorialShown', 'true');
      }, 1000);
    }
  }
  
  /**
   * Configura eventos para el tutorial
   */
  function setupTutorialEvents() {
    const closeTutorialBtn = document.getElementById('close-tutorial-btn');
    const prevTutorialBtn = document.getElementById('prev-tutorial-btn');
    const nextTutorialBtn = document.getElementById('next-tutorial-btn');
    
    if (closeTutorialBtn) {
      closeTutorialBtn.addEventListener('click', hideTutorial);
    }
    
    if (prevTutorialBtn) {
      prevTutorialBtn.addEventListener('click', () => {
        const currentStep = getCurrentTutorialStep();
        if (currentStep > 0) {
          goToTutorialStep(currentStep - 1);
        }
      });
    }
    
    if (nextTutorialBtn) {
      nextTutorialBtn.addEventListener('click', () => {
        const currentStep = getCurrentTutorialStep();
        if (currentStep < tutorialSteps.length - 1) {
          goToTutorialStep(currentStep + 1);
        } else {
          // Último paso, cerrar tutorial
          hideTutorial();
        }
      });
    }
    
    // Añadir botón para mostrar tutorial en cualquier momento
    const createFirstDeckBtn = document.getElementById('create-first-deck-btn');
    if (createFirstDeckBtn) {
      createFirstDeckBtn.addEventListener('click', (e) => {
        if (e.ctrlKey) {
          // Ctrl+Click para mostrar tutorial (atajo oculto)
          showTutorial();
        }
      });
    }
  }
  
  /**
   * Muestra el tutorial
   */
  function showTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    if (!tutorialOverlay) return;
    
    tutorialOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evitar scroll
    
    // Resetear al primer paso
    goToTutorialStep(0);
  }
  
  /**
   * Oculta el tutorial
   */
  function hideTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    if (!tutorialOverlay) return;
    
    tutorialOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Restaurar scroll
  }
  
  /**
   * Obtiene el paso actual del tutorial
   */
  function getCurrentTutorialStep() {
    const activeStep = document.querySelector('.tutorial-step.active');
    if (!activeStep) return 0;
    
    const steps = document.querySelectorAll('.tutorial-step');
    return Array.from(steps).indexOf(activeStep);
  }
  
  /**
   * Va a un paso específico del tutorial
   */
  function goToTutorialStep(stepIndex) {
    const steps = document.querySelectorAll('.tutorial-step');
    const dots = document.querySelectorAll('.tutorial-dot');
    const prevBtn = document.getElementById('prev-tutorial-btn');
    const nextBtn = document.getElementById('next-tutorial-btn');
    
    if (steps.length === 0 || dots.length === 0) return;
    
    // Actualizar pasos
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === stepIndex);
    });
    
    // Actualizar puntos
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === stepIndex);
    });
    
    // Actualizar botones
    if (prevBtn) {
      prevBtn.disabled = stepIndex === 0;
    }
    
    if (nextBtn) {
      if (stepIndex === steps.length - 1) {
        nextBtn.innerHTML = 'Finalizar <i class="fas fa-check"></i>';
      } else {
        nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
      }
    }
  }
  
  // Exponer funciones para uso global
  window.showTutorial = showTutorial;
  window.hideTutorial = hideTutorial;