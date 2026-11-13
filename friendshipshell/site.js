const video = document.querySelector('video');
const motion = document.querySelector('.motion');
if(video && motion){
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const update = () => { motion.textContent = video.paused ? 'Play animation' : 'Pause animation'; motion.setAttribute('aria-label',motion.textContent); };
 if(!reduced.matches) video.play().catch(update);
 video.addEventListener('play',update); video.addEventListener('pause',update);
 motion.addEventListener('click',()=> { if(video.paused) video.play().catch(update); else video.pause(); });
 reduced.addEventListener('change',()=>{if(reduced.matches) video.pause();}); update();
}
