document.addEventListener('DOMContentLoaded', () => {
    // Crear el canvas para las partículas
    const particlesCanvas = document.createElement('canvas');
    particlesCanvas.id = 'particles-canvas';
    document.body.prepend(particlesCanvas);
    
    // Estilos para el canvas
    particlesCanvas.style.position = 'fixed';
    particlesCanvas.style.top = '0';
    particlesCanvas.style.left = '0';
    particlesCanvas.style.width = '100%';
    particlesCanvas.style.height = '100%';
    particlesCanvas.style.pointerEvents = 'none';
    particlesCanvas.style.zIndex = '0';
    
    // Configuración de las partículas
    const ctx = particlesCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Ajustar el tamaño del canvas
    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      particlesCanvas.width = width;
      particlesCanvas.height = height;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Crear partículas
    const particlesArray = [];
    const numberOfParticles = 50;
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(126, 203, 192, ${Math.random() * 0.5})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.01;
        
        // Rebote en los bordes
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
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
            ctx.strokeStyle = `rgba(126, 203, 192, ${0.2 - distance/500})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
        
        // Regenerar partículas que se hacen muy pequeñas
        if (particlesArray[i].size <= 0.2) {
          particlesArray.splice(i, 1);
          i--;
          particlesArray.push(new Particle());
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
  });