import {storage} from "../core/storage.js";
export function initLanguage(){
 const lang=storage.get("lang","ar");apply(lang);
 document.querySelectorAll("[data-lang]").forEach(btn=>btn.addEventListener("click",()=>{const l=btn.dataset.lang;if(l==="ar"||l==="en"){storage.set("lang",l);apply(l)}}));
}
function apply(lang){
 document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";
 document.querySelectorAll("[data-i18n]").forEach(el=>{const value=el.dataset["i18n"+lang.charAt(0).toUpperCase()+lang.slice(1)];if(value)el.textContent=value});
}
