import {CONFIG} from "../core/config.js";
export function initChat(){
 const launcher=document.querySelector(".chat-launcher"),panel=document.querySelector(".chat-panel");if(!launcher||!panel)return;
 launcher.addEventListener("click",()=>{const open=panel.classList.toggle("open");launcher.setAttribute("aria-expanded",String(open))});
 const wa=panel.querySelector("[data-chat-whatsapp]"),tg=panel.querySelector("[data-chat-telegram]"),mail=panel.querySelector("[data-chat-email]");
 wa?.setAttribute("href",CONFIG.whatsapp);tg?.setAttribute("href",CONFIG.telegram);mail?.setAttribute("href",CONFIG.email);
}
