// تطبيق حجز الطيران - app.js

let airportsData = null;
const segmentsContainer = document.getElementById('segmentsContainer');
const segTemplate = document.getElementById('segmentTemplate');
const bookingForm = document.getElementById('bookingForm');
const adultCountEl = document.getElementById('adultCount');
const childCountEl = document.getElementById('childCount');
const showSummaryBtn = document.getElementById('showSummary');
const sendWhatsAppBtn = document.getElementById('sendWhatsApp');
const summaryBox = document.getElementById('summaryBox');
const summaryContent = document.getElementById('summaryContent');

let adultCount = 1, childCount = 0;

// تحميل بيانات المطارات
fetch('airports.json')
  .then(r => r.json())
  .then(data => {
    airportsData = data;
    init();
  })
  .catch(err => {
    console.error('خطأ في تحميل airports.json', err);
    alert('فشل تحميل بيانات المطارات. تأكد من وجود الملف airports.json في نفس المجلد.');
  });

function init(){
  // افتراضيًا إضافة قطاع واحد
  addSegment();

  // الاستماع لتغيير نوع الرحلة
  document.querySelectorAll('input[name="tripType"]').forEach(r => r.addEventListener('change', onTripTypeChange));

  document.getElementById('incAdult').addEventListener('click', ()=>{adultCount++; adultCountEl.textContent=adultCount});
  document.getElementById('decAdult').addEventListener('click', ()=>{if(adultCount>1)adultCount--; adultCountEl.textContent=adultCount});
  document.getElementById('incChild').addEventListener('click', ()=>{childCount++; childCountEl.textContent=childCount});
  document.getElementById('decChild').addEventListener('click', ()=>{if(childCount>0)childCount--; childCountEl.textContent=childCount});

  showSummaryBtn.addEventListener('click', showSummary);
  sendWhatsAppBtn.addEventListener('click', sendWhatsApp);
}

function onTripTypeChange(e){
  const type = e.target.value;
  if(type === 'oneway'){
    // إزالة حقول العودة في القطاع الأول
    document.querySelectorAll('.return-row').forEach(el=>el.style.display='none');
    // احتفظ بقطاع واحد
    trimToSegments(1);
  }else if(type === 'return'){
    document.querySelectorAll('.return-row').forEach(el=>el.style.display='block');
    trimToSegments(1);
  }else{
    // متعددة المدن: اجعل زر لإضافة قطاعات
    document.querySelectorAll('.return-row').forEach(el=>el.style.display='none');
    // إذا كان قطاع واحد، أضف واحد إضافي كبداية
    if(segmentsContainer.children.length < 2) addSegment();
  }
}

function trimToSegments(n){
  while(segmentsContainer.children.length > n) segmentsContainer.removeChild(segmentsContainer.lastChild);
}

function addSegment(){
  const clone = segTemplate.content.cloneNode(true);
  const seg = clone.querySelector('.segment');
  const idx = segmentsContainer.children.length + 1;
  seg.querySelector('.seg-index').textContent = idx;

  // ربط عناصر
  const fromCountry = seg.querySelector('.from-country');
  const fromCity = seg.querySelector('.from-city');
  const fromAirport = seg.querySelector('.from-airport');
  const toCountry = seg.querySelector('.to-country');
  const toCity = seg.querySelector('.to-city');
  const toAirport = seg.querySelector('.to-airport');

  populateCountrySelect(fromCountry);
  populateCountrySelect(toCountry);

  fromCountry.addEventListener('change', ()=>populateCitySelect(fromCountry, fromCity, fromAirport));
  toCountry.addEventListener('change', ()=>populateCitySelect(toCountry, toCity, toAirport));
  fromCity.addEventListener('change', ()=>populateAirportSelect(fromCountry, fromCity, fromAirport));
  toCity.addEventListener('change', ()=>populateAirportSelect(toCountry, toCity, toAirport));

  // ضبط تواريخ افتراضية
  const departDate = seg.querySelector('.depart');
  const returnDate = seg.querySelector('.return');
  const today = new Date().toISOString().split('T')[0];
  departDate.value = today;
  returnDate.value = today;

  // زر الحذف
  seg.querySelector('.remove-seg').addEventListener('click', ()=>{seg.remove(); updateSegmentIndices()});

  segmentsContainer.appendChild(clone);
  updateSegmentIndices();
}

function updateSegmentIndices(){
  [...segmentsContainer.querySelectorAll('.segment')].forEach((s,i)=>s.querySelector('.seg-index').textContent = i+1);
}

function populateCountrySelect(sel){
  sel.innerHTML = '<option value="">اختر الدولة</option>';
  Object.keys(airportsData).sort().forEach(country=>{
    const opt = document.createElement('option'); opt.value = country; opt.textContent = country; sel.appendChild(opt);
  });
}

function populateCitySelect(countrySel, citySel, airportSel){
  const country = countrySel.value;
  citySel.innerHTML = '<option value="">اختر المدينة</option>';
  airportSel.innerHTML = '<option value="">اختر المطار</option>';
  if(!country) return;
  const cities = Object.keys(airportsData[country]).sort();
  cities.forEach(city=>{const opt=document.createElement('option');opt.value=city;opt.textContent=city;citySel.appendChild(opt)});
}

function populateAirportSelect(countrySel, citySel, airportSel){
  const country = countrySel.value; const city = citySel.value;
  airportSel.innerHTML = '<option value="">اختر المطار</option>';
  if(!country||!city) return;
  const airports = airportsData[country][city];
  airports.forEach(a=>{const opt=document.createElement('option');opt.value=a.iata||a.code||a.name;opt.textContent=`${a.name} (${a.iata||a.code||''})`;airportSel.appendChild(opt)});
}

function collectForm(){
  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const cabin = document.getElementById('cabin').value;
  const segments = [];
  [...segmentsContainer.querySelectorAll('.segment')].forEach(seg=>{
    const s = {
      fromCountry: seg.querySelector('.from-country').value,
      fromCity: seg.querySelector('.from-city').value,
      fromAirport: seg.querySelector('.from-airport').value,
      toCountry: seg.querySelector('.to-country').value,
      toCity: seg.querySelector('.to-city').value,
      toAirport: seg.querySelector('.to-airport').value,
      depart: seg.querySelector('.depart').value,
      return: seg.querySelector('.return').value
    };
    segments.push(s);
  });
  return {tripType,cabin,adultCount,childCount,segments};
}

function showSummary(){
  const data = collectForm();
  let html = `<p><strong>نوع الرحلة:</strong> ${data.tripType}</p>`;
  html += `<p><strong>المسافرون:</strong> بالغين ${data.adultCount} — أطفال ${data.childCount}</p>`;
  html += `<p><strong>الدرجة:</strong> ${data.cabin}</p>`;
  html += '<ol>';
  data.segments.forEach((s,i)=>{
    html += `<li>من ${s.fromAirport || '---'} (${s.fromCity||'---'} — ${s.fromCountry||'---'}) إلى ${s.toAirport||'---'} (${s.toCity||'---'} — ${s.toCountry||'---'}) — تاريخ المغادرة: ${s.depart || '---'} ${s.return?(' — تاريخ العودة: '+s.return):''}</li>`;
  });
  html += '</ol>';
  summaryContent.innerHTML = html;
  summaryBox.classList.remove('hidden');
}

function sendWhatsApp(){
  const phone = '972000000000'; // ضع رقمك هنا بصيغة دولية بدون +
  const data = collectForm();
  let msg = `طلب حجز طيران\n`;
  msg += `نوع الرحلة: ${data.tripType}\n`;
  msg += `المسافرون: بالغين ${data.adultCount} - أطفال ${data.childCount}\n`;
  msg += `الدرجة: ${data.cabin}\n`;
  data.segments.forEach((s,i)=>{
    msg += `\nالقطاع ${i+1}:\nمن: ${s.fromAirport || s.fromCity || s.fromCountry}\nإلى: ${s.toAirport || s.toCity || s.toCountry}\nمغادرة: ${s.depart || '-'}\n`;
    if(s.return) msg += `عودة: ${s.return}\n`;
  });

  // ترميز الرسالة
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url,'_blank');
}

// إضافة زر لإضافة قطاعات عند الحاجة (خاص بمسارات متعددة)
const multiAddBtn = document.createElement('button');
multiAddBtn.textContent = 'أضف قطاع';
multiAddBtn.type = 'button';
multiAddBtn.className = 'btn';
multiAddBtn.addEventListener('click', addSegment);
segmentsContainer.parentElement.insertBefore(multiAddBtn, segmentsContainer.nextSibling);
