
const pages = [
 ['الرئيسية','index.html'],['تركيب مظلات','pages/mazallat/index.html'],['مظلات سيارات','pages/mazallat/cars.html'],
 ['مظلات مدارس','pages/mazallat/schools.html'],['مظلات مساجد','pages/mazallat/mosques.html'],['مظلات أقمشة','pages/mazallat/fabric.html'],
 ['مظلات هرمية','pages/mazallat/pyramid.html'],['تركيب سواتر','pages/sawater/index.html'],['سواتر أقمشة','pages/sawater/fabric.html'],
 ['سواتر حديد','pages/sawater/iron.html'],['سواتر أخشاب بلاستيك','pages/sawater/wood.html'],['تنسيق حدائق','pages/landscaping/index.html'],
 ['دهانات وديكورات رَنْج','pages/decor/index.html'],['دهانات إيبوكسي','pages/decor/epoxy.html'],['دهانات بروفايل','pages/decor/profile.html'],
 ['ترميم مباني رَنْج','pages/restoration/index.html'],['هناجر ومستودعات','pages/hangar/index.html'],['تركيب شبوك','pages/fences/index.html'],
 ['عوازل مائية رَنْج','pages/waterproofing/index.html'],['مقاولات عامة رَنْج','pages/contracting/index.html'],['برجولات وجلسات','pages/pergolas/index.html'],
 ['بيوت شعر','pages/poetry-houses/index.html'],['ساندوتش بانل','pages/sandwich-panel/index.html'],['المدونة','blog/index.html'],['اتصل بنا','contact.html']
];
document.addEventListener('DOMContentLoaded',()=>{
 const input=document.querySelector('.search-container input'), box=document.querySelector('.search-results');
 if(!input||!box)return;
 input.addEventListener('input',()=>{
  const q=input.value.trim().toLowerCase();
  if(!q){box.classList.remove('show');box.innerHTML='';return}
  const out=pages.filter(p=>p[0].toLowerCase().includes(q)).slice(0,10)
   .map(p=>`<a href="${p[1]}"><i class="fa-solid fa-arrow-left"></i> ${p[0]}</a>`).join('');
  box.innerHTML=out||'<div style="padding:12px;text-align:center">لا توجد نتائج</div>';
  box.classList.add('show');
 });
 document.addEventListener('click',e=>{if(!e.target.closest('.search-container'))box.classList.remove('show')});
});
