/**
 * Flashcards - Sistema principal
 * 
 * Características:
 * - Gestión de mazos y flashcards
 * - Sistema de repetición espaciada
 * - Gamificación y recompensas
 * - Estadísticas de progreso
 * - Almacenamiento local
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación
    initApp();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos guardados
    loadSavedData();
    
    // Actualizar estadísticas
    updateStats();
  });
  
  // Estado global de la aplicación
  const appState = {
    decks: [],
    currentDeckId: null,
    currentCardIndex: 0,
    studySession: {
      deckId: null,
      cards: [],
      currentIndex: 0,
      correctCount: 0,
      masteredCount: 0,
      xpEarned: 0
    },
    user: {
      level: 1,
      xp: 0,
      totalXp: 0,
      achievements: []
    },
    views: {
      dashboard: document.getElementById('dashboard-view'),
      createDeck: document.getElementById('create-deck-view'),
      deck: document.getElementById('deck-view'),
      createCard: document.getElementById('create-card-view'),
      study: document.getElementById('study-view')
    }
  };
  
  // Constantes para el sistema de XP y niveles
  const XP_CONSTANTS = {
    CREATE_DECK: 50,
    CREATE_CARD: 10,
    COMPLETE_SESSION: 100,
    MASTER_CARD: 25,
    CORRECT_ANSWER: 5,
    LEVEL_MULTIPLIER: 100 // XP necesaria para subir de nivel = nivel actual * LEVEL_MULTIPLIER
  };
  
  // Constantes para el sistema de repetición espaciada
  const SRS_CONSTANTS = {
    // Intervalos en días para cada nivel de conocimiento
    INTERVALS: [0.1, 1, 3, 7, 14, 30, 90, 180],
    // Factores de dificultad
    DIFFICULTY_FACTORS: [0.5, 0.75, 1, 1.5]
  };
  
  // Declaración de variables faltantes
  let loadSavedData = () => {};
  let updateStats = () => {};
  let initParticles = () => {};
  let filterDecks = () => {};
  let createRippleEffect = () => {};
  
  /**
   * Inicializa la aplicación
   */
  function initApp() {
    // Verificar si los elementos del DOM existen
    for (const key in appState.views) {
      if (!appState.views[key]) {
        console.error(`Elemento no encontrado: ${key}`);
      }
    }
    
    // Inicializar efectos visuales
    if (typeof initParticles === 'function') {
      initParticles();
    }
  }
  
  /**
   * Configura los event listeners
   */
  function setupEventListeners() {
    // Botones de navegación
    setupNavigationEvents();
    
    // Eventos para crear mazos
    setupDeckCreationEvents();
    
    // Eventos para crear flashcards
    setupCardCreationEvents();
    
    // Eventos para el modo de estudio
    setupStudyEvents();
    
    // Eventos para efectos visuales
    setupVisualEffects();
  }
  
  /**
   * Configura eventos de navegación
   */
  function setupNavigationEvents() {
    // Botón para crear nuevo mazo
    const createDeckBtn = document.getElementById('create-deck-btn');
    const createFirstDeckBtn = document.getElementById('create-first-deck-btn');
    
    if (createDeckBtn) {
      createDeckBtn.addEventListener('click', () => {
        showView('createDeck');
      });
    }
    
    if (createFirstDeckBtn) {
      createFirstDeckBtn.addEventListener('click', () => {
        showView('createDeck');
      });
    }
    
    // Botón para volver al dashboard desde la vista de crear mazo
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const cancelCreateDeckBtn = document.getElementById('cancel-create-deck-btn');
    
    if (backToDashboardBtn) {
      backToDashboardBtn.addEventListener('click', () => {
        showView('dashboard');
      });
    }
    
    if (cancelCreateDeckBtn) {
      cancelCreateDeckBtn.addEventListener('click', () => {
        showView('dashboard');
      });
    }
    
    // Botón para volver al dashboard desde la vista de mazo
    const backToDashboardFromDeckBtn = document.getElementById('back-to-dashboard-from-deck-btn');
    
    if (backToDashboardFromDeckBtn) {
      backToDashboardFromDeckBtn.addEventListener('click', () => {
        showView('dashboard');
      });
    }
    
    // Botón para volver al mazo desde la vista de crear tarjeta
    const backToDeckBtn = document.getElementById('back-to-deck-btn');
    const cancelCreateCardBtn = document.getElementById('cancel-create-card-btn');
    
    if (backToDeckBtn) {
      backToDeckBtn.addEventListener('click', () => {
        showView('deck');
      });
    }
    
    if (cancelCreateCardBtn) {
      cancelCreateCardBtn.addEventListener('click', () => {
        showView('deck');
      });
    }
    
    // Botón para volver al mazo desde la vista de estudio
    const backToDeckFromStudyBtn = document.getElementById('back-to-deck-from-study-btn');
    
    if (backToDeckFromStudyBtn) {
      backToDeckFromStudyBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que deseas salir de la sesión de estudio? Tu progreso no se guardará.')) {
          showView('deck');
        }
      });
    }
    
    // Botones para volver al mazo desde el resumen de estudio
    const returnToDeckBtn = document.getElementById('return-to-deck-btn');
    
    if (returnToDeckBtn) {
      returnToDeckBtn.addEventListener('click', () => {
        showView('deck');
      });
    }
    
    // Botón para reiniciar estudio
    const restartStudyBtn = document.getElementById('restart-study-btn');
    
    if (restartStudyBtn) {
      restartStudyBtn.addEventListener('click', () => {
        startStudySession(appState.currentDeckId);
      });
    }
    
    // Búsqueda de mazos
    const searchDecks = document.getElementById('search-decks');
    
    if (searchDecks) {
      searchDecks.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterDecks(searchTerm);
      });
    }
  }
  
  /**
   * Configura eventos para la creación de mazos
   */
  function setupDeckCreationEvents() {
    const saveDeckBtn = document.getElementById('save-deck-btn');
    const colorOptions = document.querySelectorAll('.color-option');
    
    if (saveDeckBtn) {
      saveDeckBtn.addEventListener('click', createNewDeck);
    }
    
    if (colorOptions) {
      colorOptions.forEach(option => {
        option.addEventListener('click', () => {
          // Quitar selección anterior
          document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          
          // Seleccionar nueva opción
          option.classList.add('selected');
        });
        
        // Seleccionar el primer color por defecto
        if (colorOptions[0]) {
          colorOptions[0].classList.add('selected');
        }
      });
    }
  }
  
  /**
   * Configura eventos para la creación de flashcards
   */
  function setupCardCreationEvents() {
    const addCardBtn = document.getElementById('add-card-btn');
    const saveCardBtn = document.getElementById('save-card-btn');
    const saveAndAddBtn = document.getElementById('save-and-add-btn');
    const flipPreviewBtn = document.getElementById('flip-preview-btn');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const previewFrontContent = document.getElementById('preview-front-content');
    const previewBackContent = document.getElementById('preview-back-content');
    const cardPreviewInner = document.getElementById('card-preview-inner');
    const contentTypeBtns = document.querySelectorAll('.content-type-btn');
    
    if (addCardBtn) {
      addCardBtn.addEventListener('click', () => {
        showView('createCard');
        resetCardForm();
      });
    }
    
    if (saveCardBtn) {
      saveCardBtn.addEventListener('click', () => {
        if (createNewCard()) {
          showView('deck');
        }
      });
    }
    
    if (saveAndAddBtn) {
      saveAndAddBtn.addEventListener('click', () => {
        if (createNewCard()) {
          resetCardForm();
          // Mantener en la vista de crear tarjeta
        }
      });
    }
    
    if (flipPreviewBtn && cardPreviewInner) {
      flipPreviewBtn.addEventListener('click', () => {
        cardPreviewInner.classList.toggle('flipped');
      });
    }
    
    // Vista previa en tiempo real
    if (cardFront && previewFrontContent) {
      cardFront.addEventListener('input', () => {
        previewFrontContent.textContent = cardFront.value || 'Frente de la tarjeta';
      });
    }
    
    if (cardBack && previewBackContent) {
      cardBack.addEventListener('input', () => {
        previewBackContent.textContent = cardBack.value || 'Reverso de la tarjeta';
      });
    }
    
    // Botones de tipo de contenido
    if (contentTypeBtns) {
      contentTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Quitar selección anterior
          document.querySelectorAll('.content-type-btn').forEach(b => {
            b.classList.remove('active');
          });
          
          // Seleccionar nuevo botón
          btn.classList.add('active');
          
          // TODO: Cambiar interfaz según el tipo de contenido
          const contentType = btn.dataset.type;
          updateContentTypeUI(contentType);
        });
      });
    }
  }
  
  /**
   * Configura eventos para el modo de estudio
   */
  function setupStudyEvents() {
    const startStudyBtn = document.getElementById('start-study-btn');
    const flipStudyCardBtn = document.getElementById('flip-study-card-btn');
    const studyCardInner = document.getElementById('study-card-inner');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    if (startStudyBtn) {
      startStudyBtn.addEventListener('click', () => {
        startStudySession(appState.currentDeckId);
      });
    }
    
    if (flipStudyCardBtn && studyCardInner) {
      flipStudyCardBtn.addEventListener('click', () => {
        studyCardInner.classList.toggle('flipped');
        
        // Mostrar controles de dificultad cuando se voltea la tarjeta
        if (studyCardInner.classList.contains('flipped')) {
          document.getElementById('study-controls').classList.remove('hidden');
        }
      });
    }
    
    if (difficultyBtns) {
      difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const difficulty = parseInt(btn.dataset.difficulty);
          rateCard(difficulty);
        });
      });
    }
    
    // Atajos de teclado para el estudio
    document.addEventListener('keydown', (e) => {
      // Solo si estamos en modo estudio
      if (!appState.views.study.classList.contains('hidden')) {
        switch (e.key) {
          case ' ': // Espacio para voltear tarjeta
            if (flipStudyCardBtn) {
              flipStudyCardBtn.click();
            }
            break;
          case '1': // Teclas 1-4 para calificar dificultad
          case '2':
          case '3':
          case '4':
            const difficulty = parseInt(e.key);
            if (studyCardInner && studyCardInner.classList.contains('flipped')) {
              rateCard(difficulty);
            }
            break;
        }
      }
    });
  }
  
  /**
   * Configura eventos para efectos visuales
   */
  function setupVisualEffects() {
    // Añadir efecto de ondas a todos los botones
    document.querySelectorAll('.action-btn, .difficulty-btn, .content-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (typeof createRippleEffect === 'function') {
          createRippleEffect(btn, e);
        }
      });
    });
  }
  
  /**
   * Muestra una vista específica y oculta las demás
   */
  function showView(viewName) {
    // Ocultar todas las vistas
    for (const key in appState.views) {
      if (appState.views[key]) {
        appState.views[key].classList.add('hidden');
      }
    }
    
    // Mostrar la vista solicitada
    if (appState.views[viewName]) {
      appState.views[viewName].classList.remove('hidden');
      
      // Acciones específicas según la vista
      switch (viewName) {
        case 'dashboard':
          renderDecks();
          updateStats();
          break;
        case 'deck':
          renderDeckDetails();
          renderCards();
          break;
        case 'createDeck':
          // Resetear formulario
          document.getElementById('deck-title').value = '';
          document.getElementById('deck-description').value = '';
          document.getElementById('deck-category').value = 'languages';
          break;
        case 'createCard':
          // Ya se maneja en setupCardCreationEvents
          break;
        case 'study':
          // Ya se maneja en startStudySession
          break;
      }
    }
  }
  
  /**
   * Crea un nuevo mazo
   */
  function createNewDeck() {
    const titleInput = document.getElementById('deck-title');
    const descriptionInput = document.getElementById('deck-description');
    const categorySelect = document.getElementById('deck-category');
    const selectedColor = document.querySelector('.color-option.selected');
    
    if (!titleInput || !categorySelect || !selectedColor) {
      console.error('Elementos del formulario no encontrados');
      return false;
    }
    
    const title = titleInput.value.trim();
    
    if (!title) {
      alert('Por favor, introduce un título para el mazo');
      return false;
    }
    
    const newDeck = {
      id: generateId(),
      title: title,
      description: descriptionInput ? descriptionInput.value.trim() : '',
      category: categorySelect.value,
      color: selectedColor.dataset.color,
      cards: [],
      created: Date.now(),
      lastStudied: null,
      studySessions: 0
    };
    
    // Añadir el mazo a la lista
    appState.decks.push(newDeck);
    
    // Guardar datos
    saveData();
    
    // Añadir XP
    addXP(XP_CONSTANTS.CREATE_DECK);
    
    // Mostrar efecto de confeti
    if (typeof createConfetti === 'function') {
      createConfetti('low');
    }
    
    // Volver al dashboard
    showView('dashboard');
    
    return true;
  }
  
  /**
   * Crea una nueva flashcard
   */
  function createNewCard() {
    const frontInput = document.getElementById('card-front');
    const backInput = document.getElementById('card-back');
    const activeContentType = document.querySelector('.content-type-btn.active');
    
    if (!frontInput || !backInput) {
      console.error('Elementos del formulario no encontrados');
      return false;
    }
    
    const front = frontInput.value.trim();
    const back = backInput.value.trim();
    
    if (!front || !back) {
      alert('Por favor, completa ambos lados de la flashcard');
      return false;
    }
    
    const contentType = activeContentType ? activeContentType.dataset.type : 'text';
    
    const newCard = {
      id: generateId(),
      front: front,
      back: back,
      contentType: contentType,
      created: Date.now(),
      lastReviewed: null,
      nextReview: Date.now(), // Disponible para revisar inmediatamente
      interval: 0, // Intervalo en días
      easeFactor: 2.5, // Factor de facilidad (algoritmo SM-2)
      repetitions: 0, // Número de repasos correctos consecutivos
      mastery: 0 // Nivel de dominio (0-4)
    };
    
    // Encontrar el mazo actual
    const deckIndex = appState.decks.findIndex(deck => deck.id === appState.currentDeckId);
    
    if (deckIndex === -1) {
      console.error('Mazo no encontrado');
      return false;
    }
    
    // Añadir la tarjeta al mazo
    appState.decks[deckIndex].cards.push(newCard);
    
    // Guardar datos
    saveData();
    
    // Añadir XP
    addXP(XP_CONSTANTS.CREATE_CARD);
    
    return true;
  }
  
  /**
   * Resetea el formulario de creación de tarjetas
   */
  function resetCardForm() {
    const frontInput = document.getElementById('card-front');
    const backInput = document.getElementById('card-back');
    const previewFrontContent = document.getElementById('preview-front-content');
    const previewBackContent = document.getElementById('preview-back-content');
    const cardPreviewInner = document.getElementById('card-preview-inner');
    
    if (frontInput) frontInput.value = '';
    if (backInput) backInput.value = '';
    if (previewFrontContent) previewFrontContent.textContent = 'Frente de la tarjeta';
    if (previewBackContent) previewBackContent.textContent = 'Reverso de la tarjeta';
    if (cardPreviewInner && cardPreviewInner.classList.contains('flipped')) {
      cardPreviewInner.classList.remove('flipped');
    }
    
    // Enfocar el primer campo
    if (frontInput) frontInput.focus();
  }
  
  /**
   * Actualiza la interfaz según el tipo de contenido seleccionado
   */
  function updateContentTypeUI(contentType) {
    // TODO: Implementar cambios en la interfaz según el tipo de contenido
    console.log(`Tipo de contenido seleccionado: ${contentType}`);
    
    // Por ahora, solo mostramos un mensaje
    const formGroup = document.querySelector('.form-group:nth-child(3)');
    
    if (formGroup) {
      let message = '';
      
      switch (contentType) {
        case 'image':
          message = '<p class="content-type-message">La funcionalidad de imágenes estará disponible próximamente.</p>';
          break;
        case 'audio':
          message = '<p class="content-type-message">La funcionalidad de audio estará disponible próximamente.</p>';
          break;
      }
      
      // Añadir mensaje si existe
      const existingMessage = formGroup.querySelector('.content-type-message');
      
      if (existingMessage) {
        existingMessage.remove();
      }
      
      if (message) {
        formGroup.insertAdjacentHTML('beforeend', message);
      }
    }
  }
  
  /**
   * Inicia una sesión de estudio
   */
  function startStudySession(deckId) {
    const deckIndex = appState.decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex === -1) {
      console.error('Mazo no encontrado');
      return;
    }
    
    const deck = appState.decks[deckIndex];
    
    // Verificar si hay tarjetas
    if (deck.cards.length === 0) {
      alert('Este mazo no tiene flashcards. Añade algunas antes de estudiar.');
      return;
    }
    
    // Preparar sesión de estudio
    appState.studySession = {
      deckId: deckId,
      cards: prepareCardsForStudy(deck.cards),
      currentIndex: 0,
      correctCount: 0,
      masteredCount: 0,
      xpEarned: 0
    };
    
    // Actualizar contador de sesiones
    deck.studySessions++;
    deck.lastStudied = Date.now();
    
    // Actualizar vista
    showView('study');
    
    // Actualizar título
    const studyDeckTitle = document.getElementById('study-deck-title');
    if (studyDeckTitle) {
      studyDeckTitle.textContent = `Estudiando: ${deck.title}`;
    }
    
    // Mostrar primera tarjeta
    showNextStudyCard();
    
    // Ocultar resumen de sesión
    const studySessionSummary = document.getElementById('study-session-summary');
    if (studySessionSummary) {
      studySessionSummary.classList.add('hidden');
    }
    
    // Guardar datos
    saveData();
  }
  
  /**
   * Prepara las tarjetas para estudio, ordenándolas según prioridad
   */
  function prepareCardsForStudy(cards) {
    // Clonar las tarjetas para no modificar las originales
    const studyCards = JSON.parse(JSON.stringify(cards));
    
    // Filtrar tarjetas que deben ser estudiadas (nextReview <= ahora)
    const now = Date.now();
    const dueCards = studyCards.filter(card => !card.nextReview || card.nextReview <= now);
    
    // Ordenar por prioridad:
    // 1. Nunca revisadas
    // 2. Menor nivel de dominio
    // 3. Más tiempo desde la última revisión
    dueCards.sort((a, b) => {
      // Nunca revisadas primero
      if (!a.lastReviewed && b.lastReviewed) return -1;
      if (a.lastReviewed && !b.lastReviewed) return 1;
      
      // Por nivel de dominio (menor primero)
      if (a.mastery !== b.mastery) return a.mastery - b.mastery;
      
      // Por tiempo desde última revisión (más antiguo primero)
      return (a.lastReviewed || 0) - (b.lastReviewed || 0);
    });
    
    return dueCards;
  }
  
  /**
   * Muestra la siguiente tarjeta de estudio
   */
  function showNextStudyCard() {
    const session = appState.studySession;
    
    // Verificar si hay más tarjetas
    if (session.currentIndex >= session.cards.length) {
      finishStudySession();
      return;
    }
    
    const card = session.cards[session.currentIndex];
    
    // Actualizar contenido de la tarjeta
    const frontContent = document.getElementById('study-card-front-content');
    const backContent = document.getElementById('study-card-back-content');
    const studyCardInner = document.getElementById('study-card-inner');
    const studyControls = document.getElementById('study-controls');
    
    if (frontContent) frontContent.textContent = card.front;
    if (backContent) backContent.textContent = card.back;
    
    // Resetear la tarjeta a su posición frontal
    if (studyCardInner && studyCardInner.classList.contains('flipped')) {
      studyCardInner.classList.remove('flipped');
    }
    
    // Ocultar controles de dificultad
    if (studyControls) {
      studyControls.classList.add('hidden');
    }
    
    // Actualizar progreso
    const cardsProgress = document.getElementById('cards-progress');
    if (cardsProgress) {
      cardsProgress.textContent = `${session.currentIndex + 1}/${session.cards.length}`;
    }
  }
  
  /**
   * Califica una tarjeta según la dificultad percibida
   */
  function rateCard(difficulty) {
    const session = appState.studySession;
    
    if (session.currentIndex >= session.cards.length) {
      return;
    }
    
    const cardId = session.cards[session.currentIndex].id;
    
    // Encontrar la tarjeta original en el mazo
    const deckIndex = appState.decks.findIndex(deck => deck.id === session.deckId);
    if (deckIndex === -1) return;
    
    const cardIndex = appState.decks[deckIndex].cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    const card = appState.decks[deckIndex].cards[cardIndex];
    
    // Aplicar algoritmo de repetición espaciada (basado en SM-2)
    updateCardWithSRS(card, difficulty);
    
    // Actualizar estadísticas de la sesión
    if (difficulty >= 3) {
      session.correctCount++;
      
      // Añadir XP
      const xp = XP_CONSTANTS.CORRECT_ANSWER;
      session.xpEarned += xp;
      addXP(xp);
    }
    
    // Verificar si la tarjeta ha sido dominada
    if (card.mastery === 4 && difficulty === 4) {
      session.masteredCount++;
      
      // Añadir XP extra por dominar una tarjeta
      const xp = XP_CONSTANTS.MASTER_CARD;
      session.xpEarned += xp;
      addXP(xp);
      
      // Efecto visual
      if (typeof createConfetti === 'function') {
        createConfetti('low');
      }
    }
    
    // Guardar datos
    saveData();
    
    // Avanzar a la siguiente tarjeta
    session.currentIndex++;
    showNextStudyCard();
  }
  
  /**
   * Actualiza una tarjeta usando el algoritmo de repetición espaciada
   */
  function updateCardWithSRS(card, difficulty) {
    // Registrar revisión
    card.lastReviewed = Date.now();
    
    // Actualizar repeticiones y factor de facilidad según SM-2
    if (difficulty >= 3) { // Respuesta correcta
      card.repetitions++;
    } else { // Respuesta incorrecta
      card.repetitions = 0;
    }
    
    // Ajustar factor de facilidad (entre 1.3 y 2.5)
    const diffFactor = SRS_CONSTANTS.DIFFICULTY_FACTORS[difficulty - 1] || 1;
    card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - difficulty) * 0.08 + (diffFactor - 1)));
    
    // Calcular nuevo intervalo
    if (card.repetitions === 0) {
      card.interval = 0.1; // Repasar pronto si fue incorrecta
    } else if (card.repetitions === 1) {
      card.interval = 1; // 1 día
    } else if (card.repetitions === 2) {
      card.interval = 3; // 3 días
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    
    // Limitar intervalo máximo a 180 días (6 meses)
    card.interval = Math.min(card.interval, 180);
    
    // Calcular próxima revisión
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + card.interval);
    card.nextReview = nextReviewDate.getTime();
    
    // Actualizar nivel de dominio (0-4)
    // 0: No aprendida, 1: Aprendiendo, 2: Revisión, 3: Casi dominada, 4: Dominada
    if (difficulty === 1) {
      card.mastery = Math.max(0, card.mastery - 1); // Retroceder un nivel
    } else if (difficulty === 4 && card.interval >= 30) {
      card.mastery = 4; // Dominada si intervalo >= 30 días y respuesta perfecta
    } else if (difficulty >= 3) {
      card.mastery = Math.min(3, card.mastery + 1); // Avanzar un nivel si correcta
    }
  }
  
  /**
   * Finaliza la sesión de estudio y muestra el resumen
   */
  function finishStudySession() {
    const session = appState.studySession;
    
    // Mostrar resumen
    const studySessionSummary = document.getElementById('study-session-summary');
    const summaryTotalCards = document.getElementById('summary-total-cards');
    const summaryCorrectCards = document.getElementById('summary-correct-cards');
    const summaryMasteredCards = document.getElementById('summary-mastered-cards');
    const summaryXpEarned = document.getElementById('summary-xp-earned');
    
    if (studySessionSummary) {
      studySessionSummary.classList.remove('hidden');
    }
    
    if (summaryTotalCards) {
      summaryTotalCards.textContent = session.cards.length;
    }
    
    if (summaryCorrectCards) {
      summaryCorrectCards.textContent = session.correctCount;
    }
    
    if (summaryMasteredCards) {
      summaryMasteredCards.textContent = session.masteredCount;
    }
    
    if (summaryXpEarned) {
      summaryXpEarned.textContent = session.xpEarned;
    }
    
    // Ocultar tarjeta de estudio
    const studyCardContainer = document.getElementById('study-card-container');
    if (studyCardContainer) {
      studyCardContainer.style.display = 'none';
    }
    
    // Añadir XP por completar la sesión
    addXP(XP_CONSTANTS.COMPLETE_SESSION);
    
    // Efecto de confeti
    if (typeof createConfetti === 'function') {
      createConfetti('low');
    }
  }
  
  /**
   * Genera un ID único
   */
  function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Guarda los datos de la aplicación en el almacenamiento local
   */
  function saveData() {
    try {
      localStorage.setItem('flashcardsData', JSON.stringify(appState));
    } catch (e) {
      console.error('Error al guardar los datos:', e);
    }
  }
  
  /**
   * Carga los datos guardados de la aplicación desde el almacenamiento local
   */
  loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('flashcardsData');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Recorrer las propiedades del objeto guardado
        for (const key in parsedData) {
          if (parsedData.hasOwnProperty(key)) {
            appState[key] = parsedData[key];
          }
        }
        
        // Convertir las fechas guardadas en milisegundos a objetos Date
        appState.decks.forEach(deck => {
          if (deck.created) {
            deck.created = new Date(deck.created);
          }
          if (deck.lastStudied) {
            deck.lastStudied = new Date(deck.lastStudied);
          }
          
          deck.cards.forEach(card => {
            if (card.created) {
              card.created = new Date(card.created);
            }
            if (card.lastReviewed) {
              card.lastReviewed = new Date(card.lastReviewed);
            }
            if (card.nextReview) {
              card.nextReview = new Date(card.nextReview);
            }
          });
        });
        
        console.log('Datos cargados correctamente');
      } else {
        console.log('No se encontraron datos guardados');
      }
    } catch (e) {
      console.error('Error al cargar los datos:', e);
    }
  };
  
  /**
   * Añade XP al usuario
   */
  function addXP(xp) {
    appState.user.xp += xp;
    appState.user.totalXp += xp;
    
    // Verificar si el usuario sube de nivel
    const requiredXp = appState.user.level * XP_CONSTANTS.LEVEL_MULTIPLIER;
    
    if (appState.user.xp >= requiredXp) {
      appState.user.xp -= requiredXp;
      appState.user.level++;
      
      // Mostrar notificación de nivel
      showLevelUpNotification(appState.user.level);
    }
    
    // Guardar datos
    saveData();
    
    // Actualizar interfaz
    updateStats();
  }
  
  /**
   * Muestra una notificación de subida de nivel
   */
  function showLevelUpNotification(level) {
    alert(`¡Felicidades! Has subido al nivel ${level}`);
  }
  
  /**
   * Renderiza la lista de mazos en el dashboard
   */
  function renderDecks() {
    const decksContainer = document.getElementById('decks-container');
    
    if (!decksContainer) {
      console.error('Contenedor de mazos no encontrado');
      return;
    }
    
    // Limpiar contenedor
    decksContainer.innerHTML = '';
    
    if (appState.decks.length === 0) {
      // Mostrar mensaje de "no hay mazos"
      decksContainer.innerHTML = `
        <div class="empty-state">
          <p>Aún no has creado ningún mazo.</p>
          <button id="create-first-deck-btn" class="action-btn">Crear mi primer mazo</button>
        </div>
      `;
      
      // Añadir event listener al botón
      const createFirstDeckBtn = document.getElementById('create-first-deck-btn');
      
      if (createFirstDeckBtn) {
        createFirstDeckBtn.addEventListener('click', () => {
          showView('createDeck');
        });
      }
    } else {
      // Renderizar cada mazo
      appState.decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.classList.add('deck-card');
        deckElement.style.backgroundColor = deck.color;
        
        const cardCount = deck.cards.length;
        const nextReviewCardCount = deck.cards.filter(card => !card.nextReview || card.nextReview <= Date.now()).length;
        
        deckElement.innerHTML = `
          <h3>${deck.title}</h3>
          <p class="deck-description">${deck.description}</p>
          <div class="deck-stats">
            <span>${cardCount} tarjetas</span>
            <span>${nextReviewCardCount} para repasar</span>
          </div>
        `;
        
        // Añadir evento para ver detalles del mazo
        deckElement.addEventListener('click', () => {
          appState.currentDeckId = deck.id;
          showView('deck');
        });
        
        decksContainer.appendChild(deckElement);
      });
    }
  }
  
  /**
   * Renderiza los detalles de un mazo específico
   */
  function renderDeckDetails() {
    const deckTitle = document.getElementById('deck-title-detail');
    const deckDescription = document.getElementById('deck-description-detail');
    const deckCategory = document.getElementById('deck-category-detail');
    const deckStats = document.getElementById('deck-stats-detail');
    
    if (!deckTitle || !deckDescription || !deckCategory || !deckStats) {
      console.error('Elementos de detalle del mazo no encontrados');
      return;
    }
    
    // Encontrar el mazo actual
    const deck = appState.decks.find(deck => deck.id === appState.currentDeckId);
    
    if (!deck) {
      console.error('Mazo no encontrado');
      return;
    }
    
    // Actualizar contenido
    deckTitle.textContent = deck.title;
    deckDescription.textContent = deck.description;
    deckCategory.textContent = `Categoría: ${deck.category}`;
    deckStats.innerHTML = `
      <span>Creado: ${new Date(deck.created).toLocaleDateString()}</span>
      <span>Sesiones de estudio: ${deck.studySessions}</span>
      <span>Último estudio: ${deck.lastStudied ? new Date(deck.lastStudied).toLocaleDateString() : 'Nunca'}</span>
    `;
  }
  
  /**
   * Renderiza las flashcards de un mazo específico
   */
  function renderCards() {
    const cardsContainer = document.getElementById('cards-container');
    
    if (!cardsContainer) {
      console.error('Contenedor de tarjetas no encontrado');
      return;
    }
    
    // Limpiar contenedor
    cardsContainer.innerHTML = '';
    
    // Encontrar el mazo actual
    const deck = appState.decks.find(deck => deck.id === appState.currentDeckId);
    
    if (!deck) {
      console.error('Mazo no encontrado');
      return;
    }
    
    if (deck.cards.length === 0) {
      // Mostrar mensaje de "no hay tarjetas"
      cardsContainer.innerHTML = `
        <div class="empty-state">
          <p>Este mazo no tiene flashcards.</p>
          <button id="add-card-btn" class="action-btn">Añadir mi primera tarjeta</button>
        </div>
      `;
      
      // Añadir event listener al botón
      const addCardBtn = document.getElementById('add-card-btn');
      
      if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
          showView('createCard');
          resetCardForm();
        });
      }
    } else {
      // Renderizar cada tarjeta
      deck.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        cardElement.innerHTML = `
          <div class="card-front">${card.front}</div>
          <div class="card-back">${card.back}</div>
        `;
        
        cardsContainer.appendChild(cardElement);
      });
    }
  }
  
  /**
   * Actualiza las estadísticas del usuario en el dashboard
   */
  updateStats = () => {
    const levelElement = document.getElementById('level');
    const xpElement = document.getElementById('xp');
    const nextLevelXpElement = document.getElementById('next-level-xp');
    
    if (!levelElement || !xpElement || !nextLevelXpElement) {
      console.error('Elementos de estadísticas no encontrados');
      return;
    }
    
    levelElement.textContent = appState.user.level;
    xpElement.textContent = appState.user.xp;
    nextLevelXpElement.textContent = appState.user.level * XP_CONSTANTS.LEVEL_MULTIPLIER;
  }
  
  /**
   * Filtra los mazos según el término de búsqueda
   */
  filterDecks = (searchTerm) => {
    const filteredDecks = appState.decks.filter(deck => {
      return deck.title.toLowerCase().includes(searchTerm) || deck.description.toLowerCase().includes(searchTerm);
    });
    
    // Renderizar los mazos filtrados
    renderFilteredDecks(filteredDecks);
  }
  
  /**
   * Renderiza los mazos filtrados
   */
  function renderFilteredDecks(decks) {
    const decksContainer = document.getElementById('decks-container');
    
    if (!decksContainer) {
      console.error('Contenedor de mazos no encontrado');
      return;
    }
    
    // Limpiar contenedor
    decksContainer.innerHTML = '';
    
    if (decks.length === 0) {
      // Mostrar mensaje de "no se encontraron mazos"
      decksContainer.innerHTML = `
        <div class="empty-state">
          <p>No se encontraron mazos con ese término de búsqueda.</p>
        </div>
      `;
    } else {
      // Renderizar cada mazo
      decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.classList.add('deck-card');
        deckElement.style.backgroundColor = deck.color;
        
        const cardCount = deck.cards.length;
        const nextReviewCardCount = deck.cards.filter(card => !card.nextReview || card.nextReview <= Date.now()).length;
        
        deckElement.innerHTML = `
          <h3>${deck.title}</h3>
          <p class="deck-description">${deck.description}</p>
          <div class="deck-stats">
            <span>${cardCount} tarjetas</span>
            <span>${nextReviewCardCount} para repasar</span>
          </div>
        `;
        
        // Añadir evento para ver detalles del mazo
        deckElement.addEventListener('click', () => {
          appState.currentDeckId = deck.id;
          showView('deck');
        });
        
        decksContainer.appendChild(deckElement);
      });
    }
  }
  
  /**
   * Crea un efecto de onda en un botón
   */
  createRippleEffect = (element, event) => {
    const ripple = document.createElement("span");
  
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
  
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - (element.offsetLeft + radius)}px`;
    ripple.style.top = `${event.clientY - (element.offsetTop + radius)}px`;
    ripple.classList.add("ripple");
  
    const rippleEffect = element.getElementsByClassName("ripple")[0];
  
    if (rippleEffect) {
      rippleEffect.remove();
    }
  
    element.appendChild(ripple);
  }
  
  /**
   * Crea un efecto de confeti
   */
  function createConfetti(intensity = 'medium') {
    // Implementar efecto de confeti (usando una librería externa o creando el efecto manualmente)
    // Por ejemplo, usando confetti-js: https://www.npmjs.com/package/confetti-js
    // O creando elementos div con estilos aleatorios y animaciones
    console.log(`Confeti ${intensity}`);
  }