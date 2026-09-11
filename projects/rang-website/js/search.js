
const searchPages=[
['مظلات سيارات','pages/mazallat/cars.html'],['مظلات مدارس','pages/mazallat/schools.html'],['مظلات مساجد','pages/mazallat/mosques.html'],
['مظلات اقمشة','pages/mazallat/fabric.html'],['مظلات هرمية','pages/mazallat/pyramid.html'],['سواتر اقمشة','pages/sawater/fabric.html'],
['سواتر حديد','pages/sawater/iron.html'],['سواتر اخشاب بلاستيك','pages/sawater/wood.html'],['هناجر ومستودعات الرياض','pages/hangar/riyadh.html'],
['دهانات ايبوكسي','pages/decor/epoxy.html'],['دهانات الرياض','pages/decor/riyadh.html'],['ترميم مباني الرياض','pages/restoration/riyadh.html'],
['مقاولات عامة','pages/contracting/index.html'],['عوازل مائية','pages/waterproofing/index.html'],['برجولات الرياض','pages/pergolas/riyadh.html']
];
function doSearch(input){
 const q=input.value.trim().toLowerCase();
 if(!q)return;
 const found=searchPages.find(x=>x[0].toLowerCase().includes(q));
 if(found) location.href=found[1]; else alert('لم يتم العثور على نتيجة مطابقة.');
}
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.querySelector('.searchbox');
 if(form){form.addEventListener('submit',e=>{e.preventDefault();doSearch(form.querySelector('input'))})}
});
