import {CONFIG} from "../core/config.js";

export function initFooterEnhancer(){
 const footer=document.querySelector('.site-footer');
 if(!footer || footer.dataset.enhanced==='true') return;
 footer.dataset.enhanced='true';

 const brand=footer.querySelector('.footer-brand');
 if(brand){
   // Socials (إن لم تكن موجودة)
   if(!brand.querySelector('.footer-socials')){
     const socials=document.createElement('div');
     socials.className='footer-socials';
     socials.setAttribute('aria-label','روابط التواصل الاجتماعي');
     socials.innerHTML=`
      <a href="${CONFIG.facebook}" target="_blank" rel="noopener" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="${CONFIG.linkedin}" target="_blank" rel="noopener" aria-label="لينكدإن"><i class="fa-brands fa-linkedin-in"></i></a>
      <a href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="إنستغرام"><i class="fa-brands fa-instagram"></i></a>
      <a href="${CONFIG.github}" target="_blank" rel="noopener" aria-label="جيتهاب"><i class="fa-brands fa-github"></i></a>
      <a href="${CONFIG.whatsapp}" target="_blank" rel="noopener" aria-label="واتساب"><i class="fa-brands fa-whatsapp"></i></a>
      <a href="${CONFIG.telegram}" target="_blank" rel="noopener" aria-label="تيليجرام"><i class="fa-brands fa-telegram"></i></a>`;
     brand.appendChild(socials);
   }
   // Contact line (إن لم تكن موجودة)
   if(!brand.querySelector('.footer-contact-line')){
     const contact=document.createElement('div');
     contact.className='footer-contact-line';
     contact.innerHTML=`
      <span><i class="fa-solid fa-location-dot"></i> صنعاء، اليمن</span>
      <a href="tel:+967770200970"><i class="fa-solid fa-phone"></i> +967770200970</a>
      <a href="${CONFIG.email}"><i class="fa-solid fa-envelope"></i> 2025ooss@gmail.com</a>`;
     brand.appendChild(contact);
   }
 }

 // Footer status (إن لم يكن موجوداً)
 const bottom=footer.querySelector('.footer-bottom');
 if(bottom && !bottom.querySelector('.footer-status')){
   const status=document.createElement('span');
   status.className='footer-status';
   status.innerHTML='<i aria-hidden="true"></i> متصلون';
   bottom.appendChild(status);
 }
}