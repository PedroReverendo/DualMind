/**
 * Efectos visuales para Flashcards
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el canvas de partículas
    initParticles();
    
    // Configurar observadores para animaciones
    setupAnimationObservers();
  });
  
  /**
   * Inicializa el sistema de partículas en el fondo
   */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Ajustar el tamaño del canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Crear partículas iniciales
    function createParticles() {
      particles = [];
      const particleCount = Math.floor(window.innerWidth / 10);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(126, 203, 192, ${Math.random() * 0.5 + 0.1})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          directionChangeTime: 0
        });
      }
    }
    
    // Dibujar y actualizar partículas
    function updateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Cambiar dirección aleatoriamente
        if (Math.random() < 0.01) {
          particle.speedX = Math.random() * 0.5 - 0.25;
          particle.speedY = Math.random() * 0.5 - 0.25;
        }
        
        // Actualizar posición
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebote en los bordes
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Conectar partículas cercanas
      connectParticles();
      
      requestAnimationFrame(updateParticles);
    }
    
    // Conectar partículas cercanas con líneas
    function connectParticles() {
      const maxDistance = 100;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(126, 203, 192, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // Inicializar
    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
    
    resizeCanvas();
    createParticles();
    updateParticles();
  }
  
  /**
   * Configura observadores para animaciones de entrada
   */
  function setupAnimationObservers() {
    // Usar Intersection Observer para animar elementos cuando entran en la vista
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Observar elementos que queremos animar
    document.querySelectorAll('.deck-card, .stat-card').forEach(el => {
      observer.observe(el);
    });
  }
  
  /**
   * Crea un efecto de confeti para celebraciones
   */
  function createConfetti(intensity = 'medium') {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    // Limpiar confeti anterior
    container.innerHTML = '';
    
    // Determinar la cantidad de confeti según la intensidad
    let count;
    switch (intensity) {
      case 'low':
        count = 30;
        break;
      case 'high':
        count = 150;
        break;
      case 'medium':
      default:
        count = 80;
        break;
    }
    
    // Colores del confeti
    const colors = [
      '#7ECBC0', // Color secundario
      '#64FFDA', // Variante más clara
      '#4DB6AC', // Variante más oscura
      '#FFD54F', // Amarillo
      '#FF8A65', // Naranja
      '#BA68C8'  // Púrpura
    ];
    
    // Crear piezas de confeti
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      
      // Estilos aleatorios
      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 2;
      const rotation = Math.random() * 360;
      
      // Aplicar estilos
      confetti.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        top: -20px;
        left: ${left}%;
        opacity: 0;
        transform: rotate(${rotation}deg);
        animation: confetti-fall ${duration}s ease-in-out ${delay}s forwards;
      `;
      
      container.appendChild(confetti);
    }
    
    // Eliminar confeti después de la animación
    setTimeout(() => {
      container.innerHTML = '';
    }, 6000);
  }
  
  // Añadir keyframes para la animación del confeti
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        opacity: 1;
        top: -20px;
        transform: translateX(0) rotate(0deg);
      }
      25% {
        opacity: 1;
        transform: translateX(${Math.random() > 0.5 ? 25 : -25}px) rotate(${Math.random() * 360}deg);
      }
      50% {
        opacity: 1;
        transform: translateX(${Math.random() > 0.5 ? -15 : 15}px) rotate(${Math.random() * 360}deg);
      }
      75% {
        opacity: 1;
        transform: translateX(${Math.random() > 0.5 ? 15 : -15}px) rotate(${Math.random() * 360}deg);
      }
      100% {
        opacity: 0;
        top: 100vh;
        transform: translateX(${Math.random() > 0.5 ? 25 : -25}px) rotate(${Math.random() * 720}deg);
      }
    }
  `;
  document.head.appendChild(style);
  
  /**
   * Crea un efecto de brillo para elementos
   * @param {HTMLElement} element - Elemento al que aplicar el brillo
   */
  function createGlowEffect(element) {
    if (!element) return;
    
    // Añadir clase para el efecto
    element.classList.add('glow-effect');
    
    // Añadir animación temporal
    element.style.animation = 'pulse 0.5s ease-in-out 3';
    
    // Eliminar animación después
    setTimeout(() => {
      element.style.animation = '';
    }, 1500);
  }
  
  /**
   * Crea un efecto de ondas para botones
   * @param {HTMLElement} button - Botón al que aplicar el efecto
   */
  function createRippleEffect(button, event) {
    if (!button) return;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    
    // Posicionar el efecto donde se hizo clic
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    // Eliminar el efecto después de la animación
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Añadir estilos para el efecto de ondas
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);
  
  // Exponer funciones para uso global
  window.createConfetti = createConfetti;
  window.createGlowEffect = createGlowEffect;
  window.createRippleEffect = createRippleEffect;