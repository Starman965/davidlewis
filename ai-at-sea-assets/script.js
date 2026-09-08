const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#site-nav');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Open menu':'Close menu');nav.classList.toggle('open',!open)});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false')}));

const form=document.querySelector('#inquiry-form');
form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const data=new FormData(form);
  const eventName=data.get('event')?.trim();
  const date=data.get('date')?.trim()||'Flexible';
  const notes=data.get('notes')?.trim()||'No additional notes';
  const inquiry=`AI KEYNOTE INQUIRY\n\nShip or event: ${eventName}\nPreferred date: ${date}\nDetails: ${notes}\n\nI would like to discuss bringing David Lewis aboard.`;
  const status=form.querySelector('.form-status');
  try{
    await navigator.clipboard.writeText(inquiry);
    status.textContent='Inquiry copied. Paste it into an email to David or your entertainment team.';
  }catch(error){
    status.textContent='Your inquiry is ready—select and copy the details from the fields above.';
  }
});
