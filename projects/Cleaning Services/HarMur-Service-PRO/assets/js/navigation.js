
document.addEventListener('DOMContentLoaded',()=>{
const btn=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav-links');
if(btn)btn.onclick=()=>nav.classList.toggle('active');
});
