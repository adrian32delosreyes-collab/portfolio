// main.js
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Projects data & render ---------- */
  const categories = ["all", "digital marketing", "photography", "videography", "video editing"];
  const projects = [
    { id: 1, category: "digital marketing", title: "Marketing Campaign 1", description: "A digital marketing campaign focused on social media engagement." },
    { id: 2, category: "photography", title: "Portrait Shoot", description: "A professional portrait session using natural lighting techniques." },
    { id: 3, category: "videography", title: "Promo Video", description: "A short promotional video crafted for a product launch." },
    { id: 4, category: "video editing", title: "Short Film Edit", description: "A cinematic short film editing project focusing on color grading and pacing." },
    { id: 5, category: "digital marketing", title: "Ad Design", description: "A digital ad series created for an online campaign." },
  ];

  const projectsContainer = document.getElementById('projects-section');

  // Build project section markup
  projectsContainer.innerHTML = `
    <section class="project-section" id="projects">
      <h2 class="section-title">My Projects</h2>
      <div class="filter-buttons" id="filter-buttons"></div>
      <div class="project-grid" id="project-grid"></div>
    </section>
  `;

  const filterButtonsRow = document.getElementById('filter-buttons');
  const projectGrid = document.getElementById('project-grid');

  let selectedCategory = 'all';
  let selectedProject = null;
  let filteredProjects = projects.slice();

  function renderFilterButtons() {
    filterButtonsRow.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedCategory === cat ? ' active' : '');
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.addEventListener('click', () => {
        selectedCategory = cat;
        applyFilter();
        renderFilterButtons();
        renderProjects();
      });
      filterButtonsRow.appendChild(btn);
    });
  }

  function applyFilter() {
    filteredProjects = selectedCategory === 'all' ? projects.slice() : projects.filter(p => p.category === selectedCategory);
  }

  function renderProjects() {
    projectGrid.innerHTML = '';
    filteredProjects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-id', project.id);
      card.innerHTML = `
        <div class="project-placeholder">
          <span class="coming-soon">Coming soon...</span>
        </div>
        <h3>${escapeHtml(project.title)}</h3>
        <p class="category">${escapeHtml(project.category)}</p>
      `;
      card.addEventListener('click', () => openProject(project));
      projectGrid.appendChild(card);
    });
  }

  // Simple HTML escape
  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Modal
  let modalOverlay = null;

  function openProject(project) {
    selectedProject = project;
    showModal();
  }

  function showModal() {
    if (!selectedProject) return;
    if (modalOverlay) modalOverlay.remove();

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.tabIndex = -1;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.addEventListener('click', e => e.stopPropagation());

    modalContent.innerHTML = `
      <div class="modal-image"></div>
      <h2>${escapeHtml(selectedProject.title)}</h2>
      <p>${escapeHtml(selectedProject.description)}</p>
      <div class="modal-buttons-row">
        <button class="modal-btn close-btn">Close</button>
        <div class="modal-btn-group">
          <button class="modal-btn prev-btn">← Previous</button>
          <button class="modal-btn next-btn">Next →</button>
        </div>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // click outside to close
    modalOverlay.addEventListener('click', () => closeModal());

    // buttons
    modalContent.querySelector('.close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.prev-btn').addEventListener('click', prevProject);
    modalContent.querySelector('.next-btn').addEventListener('click', nextProject);

    // focus trap-ish
    modalContent.focus();

    // disable page scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }
    selectedProject = null;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function nextProject() {
    if (!selectedProject) return;
    const idx = filteredProjects.findIndex(p => p.id === selectedProject.id);
    const nextIdx = (idx + 1) % filteredProjects.length;
    selectedProject = filteredProjects[nextIdx];
    showModal();
  }
  function prevProject() {
    if (!selectedProject) return;
    const idx = filteredProjects.findIndex(p => p.id === selectedProject.id);
    const prevIdx = (idx - 1 + filteredProjects.length) % filteredProjects.length;
    selectedProject = filteredProjects[prevIdx];
    showModal();
  }

  // keyboard controls for modal
  window.addEventListener('keydown', (e) => {
    if (!selectedProject) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextProject();
    if (e.key === 'ArrowLeft') prevProject();
  });

  // Initialize
  renderFilterButtons();
  applyFilter();
  renderProjects();

  /* ---------- Hero scroll to projects ---------- */
  const heroBtn = document.getElementById('hero-view-work');
  const projectsAnchor = document.getElementById('projects');
  heroBtn && heroBtn.addEventListener('click', () => {
    projectsAnchor && projectsAnchor.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Education timeline in-view animations + line growth ---------- */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineLine = document.getElementById('timeline-line');
  if (timelineItems.length && timelineLine) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('in-view');
        }
      });
    }, { threshold: 0.3 });

    timelineItems.forEach(it => obs.observe(it));

    // Grow timeline line as page scrolls across timeline container
    const timelineContainer = document.querySelector('.timeline-container');
    function updateLine() {
      if (!timelineContainer) return;
      const rect = timelineContainer.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // compute progress from top of container entering viewport to bottom leaving
      const total = rect.height + vh;
      const visibleTop = Math.min(Math.max(vh - rect.top, 0), total);
      const progress = Math.max(0, Math.min(1, visibleTop / total));
      // line height from 10% to 100%
      const min = 0.10, max = 1;
      const h = (min + (max - min) * progress) * 100;
      timelineLine.style.height = h + '%';
    }
    updateLine();
    window.addEventListener('scroll', updateLine, { passive: true });
    window.addEventListener('resize', updateLine);
  }

  /* ---------- Footer Work with Me button navigation (already links to book-a-call.html) ---------- */
  const footerLink = document.querySelectorAll('.work-with-me');
  footerLink.forEach(el => {
    el.addEventListener('click', (e) => {
      // default will navigate; ensure top scroll
      // after navigation the book page has its content; nothing else required
    });
  });

  /* ---------- Accessibility small improvements ---------- */
  // trap focus into modal if open
  document.addEventListener('focus', (event) => {
    if (!modalOverlay) return;
    if (!modalOverlay.contains(event.target)) {
      // move focus into modal
      const first = modalOverlay.querySelector('.modal-content');
      first && first.focus();
    }
  }, true);

});

// Scroll to About Me section
document.getElementById("hero-about").addEventListener("click", function () {
  const aboutSection = document.getElementById("about-section");
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: "smooth" });
  }

  
});

