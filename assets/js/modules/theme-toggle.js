import {storage} from "../core/storage.js";
export function initTheme(){
 const saved=storage.get("theme",null), system=matchMedia("(prefers-color-scheme:dark)").matches;
 document.documentElement.dataset.theme=saved||(system?"dark":"light");
 document.querySelectorAll("[data-theme-toggle]").forEach(btn=>btn.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;storage.set("theme",next);btn.setAttribute("aria-pressed",String(next==="dark"))}));
}
