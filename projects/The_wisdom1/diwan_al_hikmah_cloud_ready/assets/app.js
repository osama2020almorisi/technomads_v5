/* ديوان الحكمة — منطق التطبيق */
let quotes = [];
let favorites = new Set();
let currentUser = null;
let unsubscribeQuotes = null;
let activeView = "home";
let activeCategory = "";
let searchTerm = "";
let isFirebaseReady = false;
let db = null;
let auth = null;

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().split("T")[0];

const DEFAULT_QUOTES = [
 {id:"default-1",text:"العلم نور والجهل ظلام.",author:"الحكمة العربية",category:"حكم",date:today()},
 {id:"default-2",text:"من جدّ وجد، ومن زرع حصد.",author:"الحكمة العربية",category:"حكم",date:today()},
 {id:"default-3",text:"خير الكلام ما قل ودل.",author:"الحكمة العربية",category:"أقوال",date:today()},
 {id:"default-4",text:"لا تؤجل عمل اليوم إلى الغد.",author:"الحكمة العربية",category:"حياة",date:today()},
 {id:"default-5",text:"اطلب العلم من المهد إلى اللحد.",author:"الحكمة العربية",category:"علم",date:today()},
 {id:"default-6",text:"الوقت كالسيف إن لم تقطعه قطعك.",author:"الحكمة العربية",category:"وقت",date:today()}
];

document.addEventListener("DOMContentLoaded", init);

async function init(){
  $("year").textContent = new Date().getFullYear();
  bindEvents();
  loadTheme();
  loadFavorites();
  loadLocalData();
  renderAll();
  setTimeout(()=> $("loadingScreen").classList.add("hidden"), 800);
  await initFirebase();
}

function bindEvents(){
  $("googleLogin").onclick = loginWithGoogle;
  $("anonymousLogin").onclick = loginAnonymously;
  $("logoutBtn").onclick = logoutUser;
  $("addBtn").onclick = ()=>openModal();
  $("emptyAdd").onclick = ()=>openModal();
  $("quoteForm").onsubmit = saveQuote;
  $("searchInput").oninput = e=>{searchTerm=e.target.value.trim().toLowerCase();renderAll()};
  $("categoryFilter").onchange = e=>{activeCategory=e.target.value;renderAll()};
  $("clearSearch").onclick = ()=>{$("searchInput").value="";searchTerm="";activeCategory="";$("categoryFilter").value="";renderAll()};
  $("refreshDaily").onclick = loadDailyWisdom;
  $("themeBtn").onclick = toggleTheme;
  $("openSidebar").onclick = ()=> $("sidebar").classList.add("open");
  $("closeSidebar").onclick = ()=> $("sidebar").classList.remove("open");
  $("overlay").onclick = closeModal;
  document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeModal);
  document.querySelectorAll(".nav-item").forEach(btn=>btn.onclick=()=>setView(btn.dataset.view));
}

function setView(view){
  activeView=view;
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $("sidebar").classList.remove("open");
  if(view==="favorites") $("listTitle").textContent="المفضلة ❤️";
  else if(view==="categories") $("listTitle").textContent="كل التصنيفات";
  else $("listTitle").textContent="كل الحكم";
  renderAll();
}

function loadTheme(){
  if(localStorage.getItem("diwan_theme")==="dark") document.body.classList.add("dark");
  $("themeBtn").textContent=document.body.classList.contains("dark")?"☀️":"🌙";
}
function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem("diwan_theme",document.body.classList.contains("dark")?"dark":"light");
  $("themeBtn").textContent=document.body.classList.contains("dark")?"☀️":"🌙";
}

function loadFavorites(){
  try{favorites=new Set(JSON.parse(localStorage.getItem(favKey())||"[]"))}catch{favorites=new Set()}
}
function favKey(){return "diwan_favorites_"+(currentUser?.uid||"local")}
function saveFavorites(){localStorage.setItem(favKey(),JSON.stringify([...favorites]))}

function loadLocalData(){
  try{
    const saved=JSON.parse(localStorage.getItem("diwan_quotes_cloud")||"null");
    quotes=Array.isArray(saved)&&saved.length?saved:DEFAULT_QUOTES.map(x=>({...x}));
  }catch{quotes=DEFAULT_QUOTES.map(x=>({...x}))}
}

function saveLocalData(){localStorage.setItem("diwan_quotes_cloud",JSON.stringify(quotes))}

function validConfig(){
  const c=window.FIREBASE_CONFIG||{};
  return c.apiKey && !c.apiKey.startsWith("YOUR_") && c.projectId && !c.projectId.startsWith("YOUR_");
}

async function initFirebase(){
  if(!validConfig()){
    setSync("offline");
    $("loadingSub").textContent="وضع محلي — أضف إعدادات Firebase للربط السحابي";
    toast("ℹ️ التطبيق يعمل محلياً. أضف إعدادات Firebase لتفعيل السحابة.","info");
    return;
  }
  try{
    firebase.initializeApp(window.FIREBASE_CONFIG);
    db=firebase.firestore();
    auth=firebase.auth();
    isFirebaseReady=true;
    try{await db.enablePersistence({synchronizeTabs:true})}catch(e){console.warn("Persistence:",e.code)}
    auth.onAuthStateChanged(handleAuthState);
    $("loadingSub").textContent="تم تجهيز الاتصال بالسحابة";
  }catch(e){
    console.error(e); setSync("offline"); toast("❌ تعذر تهيئة Firebase: "+e.message,"error");
  }
}

function handleAuthState(user){
  if(unsubscribeQuotes){unsubscribeQuotes();unsubscribeQuotes=null}
  if(user){
    currentUser=user;
    loadFavorites();
    $("authButtons").classList.add("hidden");
    $("userInfo").classList.remove("hidden");
    $("userName").textContent=user.displayName||"زائر";
    $("userEmail").textContent=user.isAnonymous?"حساب زائر":"حساب Google";
    $("userAvatar").textContent=user.displayName?(user.displayName.trim()[0]||"👤"):"👤";
    setSync("syncing");
    loadQuotesFromCloud();
  }else{
    currentUser=null;
    loadFavorites();
    $("authButtons").classList.remove("hidden");
    $("userInfo").classList.add("hidden");
    setSync("offline");
    loadLocalData(); renderAll();
  }
}

async function loginWithGoogle(){
  if(!isFirebaseReady){toast("⚠️ ضع إعدادات Firebase أولاً.","error");return}
  try{
    const provider=new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    toast("✅ تم تسجيل الدخول بنجاح");
  }catch(e){toast("❌ فشل تسجيل الدخول: "+friendlyFirebaseError(e),"error")}
}
async function loginAnonymously(){
  if(!isFirebaseReady){toast("⚠️ ضع إعدادات Firebase أولاً.","error");return}
  try{await auth.signInAnonymously();toast("👤 تم الدخول كزائر")}
  catch(e){toast("❌ فشل الدخول كزائر: "+friendlyFirebaseError(e),"error")}
}
async function logoutUser(){
  try{await auth.signOut();toast("🚪 تم تسجيل الخروج")}
  catch(e){toast("❌ خطأ في تسجيل الخروج","error")}
}

function loadQuotesFromCloud(){
  if(!currentUser||!db)return;
  setSync("syncing");
  const ref=db.collection("users").doc(currentUser.uid).collection("quotes");
  unsubscribeQuotes=ref.orderBy("date","desc").onSnapshot(snapshot=>{
    if(snapshot.empty){
      quotes=DEFAULT_QUOTES.map(x=>({...x}));
      saveLocalData();
      renderAll();
      setSync("online");
      return;
    }
    quotes=snapshot.docs.map(doc=>{
      const d=doc.data();
      return {id:doc.id,text:d.text||"",author:d.author||"غير معروف",category:d.category||"عام",date:d.date||today()};
    });
    saveLocalData();
    renderAll();
    setSync("online");
  },error=>{
    console.error(error);setSync("offline");toast("⚠️ تعذر قراءة السحابة، تم استخدام النسخة المحلية.","error");loadLocalData();renderAll();
  });
}

function setSync(status){
  const el=$("syncStatus"), cloud=$("cloudStats");
  el.className="sync-status "+status;
  const t={online:"✅ متصل",offline:"📴 محلي",syncing:"🔄 جارٍ المزامنة"};
  el.textContent=t[status]||status;
  cloud.textContent=status==="online"?"سحابي":status==="syncing"?"مزامنة":"محلي";
}

function filteredQuotes(){
  let list=[...quotes];
  if(activeView==="favorites") list=list.filter(q=>favorites.has(String(q.id)));
  if(activeCategory) list=list.filter(q=>q.category===activeCategory);
  if(searchTerm) list=list.filter(q=>(q.text+" "+q.author+" "+q.category).toLowerCase().includes(searchTerm));
  return list;
}

function renderAll(){
  updateCategories();
  renderQuotes();
  updateStats();
  updateSidebar();
  loadDailyWisdom();
}

function updateCategories(){
  const cats=[...new Set(quotes.map(q=>q.category||"عام"))].sort((a,b)=>a.localeCompare(b,"ar"));
  const current=activeCategory;
  $("categoryFilter").innerHTML='<option value="">كل التصنيفات</option>'+cats.map(c=>`<option value="${escAttr(c)}">${esc(c)}</option>`).join("");
  $("categoryFilter").value=current;
  $("categoryStats").textContent=cats.length;
  $("sideCats").textContent=cats.length;
  $("sidebarCategories").innerHTML=cats.length?cats.map(c=>`<button class="cat-link" data-cat="${escAttr(c)}">🏷️ ${esc(c)}</button>`).join(""):"<small style='color:#94a3b8'>لا توجد تصنيفات</small>";
  document.querySelectorAll(".cat-link").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;setView("home");renderAll()});
}

function renderQuotes(){
  const list=filteredQuotes();
  $("resultCount").textContent=`${list.length} نتيجة`;
  const box=$("quotesList"), empty=$("emptyState");
  if(activeView==="categories"){
    box.innerHTML=[...new Set(quotes.map(q=>q.category||"عام"))].sort().map(c=>{
      const n=quotes.filter(q=>(q.category||"عام")===c).length;
      return `<button class="quote-card" style="text-align:right;cursor:pointer" onclick="selectCategory('${escAttr(c)}')"><span class="quote-mark">🏷️</span><div class="quote-text">${esc(c)}</div><div class="quote-author">${n} حكمة</div></button>`;
    }).join("");
    empty.classList.toggle("hidden",quotes.length>0);return;
  }
  box.innerHTML=list.map(cardHtml).join("");
  empty.classList.toggle("hidden",list.length!==0);
}

function selectCategory(c){activeCategory=c;setView("home");$("categoryFilter").value=c;renderAll()}

function cardHtml(q){
  const id=String(q.id), fav=favorites.has(id);
  return `<article class="quote-card" data-id="${escAttr(id)}">
    <div class="quote-mark">❝</div>
    <div class="quote-text">${esc(q.text)}</div>
    <div class="quote-author">— ${esc(q.author||"غير معروف")}</div>
    <div class="quote-meta">
      <span class="badge">${esc(q.category||"عام")}</span>
      <div class="card-actions">
        <button class="favorite ${fav?"active":""}" title="المفضلة" onclick="toggleFavorite('${escAttr(id)}')">${fav?"❤️":"🤍"}</button>
        <button title="تعديل" onclick="editQuote('${escAttr(id)}')">✏️</button>
        <button title="حذف" onclick="deleteQuote('${escAttr(id)}')">🗑️</button>
      </div>
    </div>
  </article>`;
}

function updateStats(){
  $("totalStats").textContent=quotes.length;
  $("favoriteStats").textContent=[...favorites].filter(id=>quotes.some(q=>String(q.id)===id)).length;
  $("sideTotal").textContent=quotes.length;
  $("favCount").textContent=[...favorites].filter(id=>quotes.some(q=>String(q.id)===id)).length;
}

function updateSidebar(){updateStats()}

function loadDailyWisdom(){
  if(!quotes.length){$("dailyText").textContent="أضف أول حكمة إلى ديوانك.";$("dailyAuthor").textContent="—";return}
  const seed=new Date().getDate()+new Date().getMonth()*31;
  const q=quotes[seed%quotes.length];
  $("dailyText").textContent=q.text;
  $("dailyAuthor").textContent="— "+(q.author||"غير معروف");
}

function openModal(q=null){
  $("modalTitle").textContent=q?"تعديل الحكمة":"إضافة حكمة";
  $("quoteId").value=q?String(q.id):"";
  $("qText").value=q?.text||"";
  $("qAuthor").value=q?.author||"";
  $("qCategory").value=q?.category||"";
  $("quoteModal").classList.remove("hidden");$("overlay").classList.remove("hidden");
  setTimeout(()=>$("qText").focus(),50);
}
function closeModal(){ $("quoteModal").classList.add("hidden");$("overlay").classList.add("hidden") }

function editQuote(id){
  const q=quotes.find(x=>String(x.id)===String(id));if(q)openModal(q);
}

async function saveQuote(e){
  e.preventDefault();
  const id=$("quoteId").value.trim(), text=$("qText").value.trim();
  if(!text){toast("⚠️ اكتب نص الحكمة.","error");return}
  const payload={text,author:$("qAuthor").value.trim()||"الحكمة العربية",category:$("qCategory").value.trim()||"عام",date:today()};
  closeModal();
  if(id) await updateQuote(id,payload); else await addQuote(payload);
}

async function addQuote(data){
  if(currentUser&&db){
    try{
      setSync("syncing");
      await db.collection("users").doc(currentUser.uid).collection("quotes").add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      toast("✅ تم حفظ الحكمة في السحابة");return;
    }catch(e){console.error(e);toast("⚠️ فشل السحابي، تم حفظها محلياً.","error")}
  }
  const local={id:"local_"+Date.now(),...data};quotes.unshift(local);saveLocalData();renderAll();toast("✅ تمت الإضافة محلياً");
}

async function updateQuote(id,data){
  if(currentUser&&db&&!String(id).startsWith("local_")){
    try{
      setSync("syncing");
      await db.collection("users").doc(currentUser.uid).collection("quotes").doc(id).update(data);
      toast("✅ تم تحديث الحكمة");return;
    }catch(e){console.error(e);toast("⚠️ فشل التحديث السحابي.","error")}
  }
  const i=quotes.findIndex(q=>String(q.id)===String(id));
  if(i>=0){quotes[i]={...quotes[i],...data};saveLocalData();renderAll();toast("✅ تم التحديث محلياً")}
}

async function deleteQuote(id){
  if(!confirm("هل أنت متأكد من حذف هذه الحكمة؟"))return;
  if(currentUser&&db&&!String(id).startsWith("local_")){
    try{
      setSync("syncing");
      await db.collection("users").doc(currentUser.uid).collection("quotes").doc(id).delete();
      favorites.delete(String(id));saveFavorites();toast("🗑️ تم حذف الحكمة");return;
    }catch(e){console.error(e);toast("❌ تعذر الحذف من السحابة.","error");return}
  }
  quotes=quotes.filter(q=>String(q.id)!==String(id));favorites.delete(String(id));saveFavorites();saveLocalData();renderAll();toast("🗑️ تم الحذف محلياً");
}

function toggleFavorite(id){
  id=String(id);
  if(favorites.has(id))favorites.delete(id);else favorites.add(id);
  saveFavorites();renderAll();
}

function toast(message,type="success"){
  const el=document.createElement("div");el.className="toast";el.textContent=message;
  $("toastContainer").appendChild(el);setTimeout(()=>el.remove(),3200);
}
function friendlyFirebaseError(e){
  const map={"auth/popup-closed-by-user":"تم إغلاق نافذة تسجيل الدخول.","auth/popup-blocked":"المتصفح منع النافذة المنبثقة.","auth/operation-not-allowed":"فعّل طريقة تسجيل الدخول من Firebase Console.","auth/unauthorized-domain":"أضف نطاق الموقع إلى Authorized domains في Firebase."};
  return map[e.code]||e.message||"خطأ غير معروف";
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escAttr(s){return esc(s).replace(/`/g,"&#096;")}
