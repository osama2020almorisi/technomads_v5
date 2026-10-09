import {$,$$,on} from "../utils/dom.js";
export function initNavbar(){
 const header=$(".site-header"),toggle=$(".nav-toggle"),menu=$(".nav-links");
 const close=()=>{menu?.classList.remove("open");toggle?.setAttribute("aria-expanded","false")};
 on(toggle,"click",()=>{const open=!menu.classList.contains("open");menu.classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open))});
 $$(".nav-links a").forEach(a=>on(a,"click",close));
 const update=()=>header?.classList.toggle("scrolled",scrollY>15);update();on(window,"scroll",update,{passive:true});
 const path=location.pathname.split("/").pop()||"index.html";$$(".nav-links a").forEach(a=>{if(a.getAttribute("href")===path)a.classList.add("active")});
}
