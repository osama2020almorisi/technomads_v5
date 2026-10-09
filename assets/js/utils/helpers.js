export const debounce=(fn,wait=250)=>{let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait)}};
export const throttle=(fn,wait=100)=>{let ready=true;return(...args)=>{if(!ready)return;ready=false;fn(...args);setTimeout(()=>ready=true,wait)}};
export const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
export const formatNumber=n=>new Intl.NumberFormat(document.documentElement.lang||"ar").format(n);
export const getPage=()=>location.pathname.split("/").pop()||"index.html";
export const isExternal=url=>/^https?:\/\//i.test(url);
