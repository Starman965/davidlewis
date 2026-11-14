'use strict';
const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  let count = 0;
  projects.forEach(project => { project.hidden = category !== 'all' && project.dataset.category !== category; if (!project.hidden) count++; });
  document.getElementById('filter-status').textContent = `${count} projects shown.`;
}));
// Keep links from the former speaker homepage useful after its move.
const speakerAnchors = ['sessions','programmers','book','ai-in-action','experience','topics','ai-for-newbies','ai-in-daily-life','ai-agents','prompt-like-a-pro','ai-in-your-pocket','travel-stories-with-ai'];
if (speakerAnchors.includes(location.hash.slice(1))) location.replace('/ai-at-sea/' + location.hash);
