document.addEventListener('DOMContentLoaded', () => {
    // Elementos que se animarán al hacer scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Función para verificar si un elemento está en el viewport
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
      );
    };
    
    // Función para animar elementos cuando entran en el viewport
    const animateOnScroll = () => {
      animatedElements.forEach(element => {
        if (isInViewport(element)) {
          element.classList.add('animate');
        }
      });
    };
    
    // Ejecutar la función al cargar la página
    animateOnScroll();
    
    // Ejecutar la función al hacer scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Animaciones para el hero (se ejecutan inmediatamente)
    setTimeout(() => {
      document.querySelector('.hero__title').classList.add('animate');
      
      setTimeout(() => {
        document.querySelector('.hero__buttons').classList.add('animate');
      }, 400);
      
      setTimeout(() => {
        document.querySelector('.hero__image').classList.add('animate');
      }, 800);
    }, 300);
    
    // Efecto hover para elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, .tool-card, .feature-card__media');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
      });
      
      element.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
      });
    });
  });