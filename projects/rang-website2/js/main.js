
document.addEventListener('DOMContentLoaded',()=>{
 const menu=document.querySelector('.menu-icon'), side=document.getElementById('sidebar'),
       close=document.querySelector('.close-btn'), overlay=document.getElementById('overlay');
 const closeSide=()=>{side?.classList.remove('open');overlay?.classList.remove('active')};
 menu?.addEventListener('click',()=>{side?.classList.add('open');overlay?.classList.add('active')});
 close?.addEventListener('click',closeSide); overlay?.addEventListener('click',closeSide);

 document.querySelectorAll('.has-submenu>a').forEach(a=>a.addEventListener('click',e=>{
   e.preventDefault(); const li=a.parentElement;
   document.querySelectorAll('.has-submenu').forEach(x=>{if(x!==li)x.classList.remove('active')});
   li.classList.toggle('active');
 }));
 document.querySelectorAll('.share-icon').forEach(btn=>btn.addEventListener('click',async()=>{
   try{
     if(navigator.share) await navigator.share({title:document.title,url:location.href});
     else {await navigator.clipboard.writeText(location.href);alert('تم نسخ الرابط بنجاح');}
   }catch(e){}
 }));
 document.querySelectorAll('[data-refresh]').forEach(b=>b.addEventListener('click',()=>location.reload()));
});
