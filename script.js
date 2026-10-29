document.addEventListener("DOMContentLoaded", () => {
  const progress = document.querySelector(".scroll-progress");
  const navbar = document.querySelector(".portfolio-nav");
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll("main section[id]")];

  // 1. Scroll Progress & Navbar styling
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${percent}%`;
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
  };
  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  // 2. Reveal Animations on Scroll
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });
    
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // 3. Active Nav Link Highlighting (Scroll Spy)
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isActive);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    
    sections.forEach(section => sectionObserver.observe(section));
  }

  // 4. Close mobile menu on click
  document.querySelectorAll("#mainNav .nav-link, #mainNav .nav-contact").forEach(link => {
    link.addEventListener("click", () => {
      const nav = document.getElementById("mainNav");
      if (nav && nav.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  });

  // 5. Interactive Art Hover Effect (FIXED MATH SYNTAX)
  const art = document.querySelector(".hero-art");
  if (art && window.matchMedia("(pointer: fine)").matches) {
    art.addEventListener("pointermove", event => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      
      art.style.setProperty("--pointer-x", `${x * 10}px`);
      art.style.setProperty("--pointer-y", `${y * 10}px`);
      
      art.querySelectorAll(".art-circle").forEach((circle, index) => {
        const depth = index === 0 ? -1 : 1;
        circle.style.translate = `${x * -13 * depth}px ${y * -13 * depth}px`;
      });
    });
    
    art.addEventListener("pointerleave", () => {
      art.querySelectorAll(".art-circle").forEach(circle => { 
        circle.style.translate = ""; 
      });
    });
  }

  // 6. Interactive Per-Letter Hover Effect
  const title = document.querySelector('.hero-title');
  if (title) {
    const wrapLetters = (node) => {
      if (node.nodeType === 3) { 
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        
        // Split the text by spaces, but keep the spaces in the array
        const words = text.split(/(\s+)/);
        
        words.forEach(word => {
          if (word.trim() === '') {
            // It's a space, keep it normal
            fragment.appendChild(document.createTextNode(word));
          } else {
            // Wrap the whole word in a container that prevents mid-word breaking
            const wordBox = document.createElement('span');
            wordBox.style.whiteSpace = 'nowrap'; 
            
            // Put the individual bouncy letters inside the word box
            for (let i = 0; i < word.length; i++) {
              const span = document.createElement('span');
              span.textContent = word[i];
              span.className = 'liquid-char';
              wordBox.appendChild(span);
            }
            fragment.appendChild(wordBox);
          }
        });
        node.replaceWith(fragment);
      } 
      else if (node.nodeType === 1 && node.nodeName !== 'BR') {
        Array.from(node.childNodes).forEach(wrapLetters);
      }
    };
    
    Array.from(title.childNodes).forEach(wrapLetters);
  }
  // 7. Interactive Tech Particles (Constellation Effect)
  const initParticles = () => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    // Create the invisible canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1'; 
    canvas.style.pointerEvents = 'none';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height, particles;

    // Keep particles sized correctly if the window resizes
    const resize = () => {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle Logic
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8; // Drift speed
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(32, 35, 31, 0.4)'; // Dark ink color
        ctx.fill();
      }
    }

    // Use fewer particles on mobile to save battery
    const particleCount = window.innerWidth < 768 ? 35 : 80;
    particles = Array.from({ length: particleCount }, () => new Particle());

    // Track mouse position
    let mouse = { x: -1000, y: -1000 };
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
        
        // Connect particles to each other
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(32, 35, 31, ${0.15 - dist/800})`; // Fades with distance
            ctx.stroke();
          }
        });

        // Connect particles to mouse
        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const distm = Math.sqrt(dxm * dxm + dym * dym);
        if (distm < 180) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 128, 93, ${0.4 - distm/450})`; // Glowing orange
          ctx.stroke();
        }
      });
      requestAnimationFrame(animate);
    };
    animate();
  };
  initParticles();
});