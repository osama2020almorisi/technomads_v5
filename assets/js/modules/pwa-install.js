export function initPWAInstall(){
 let deferred=null;const box=document.querySelector(".install-prompt");if(!box)return;
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;box.classList.add("show")});
 box.querySelector("[data-install]")?.addEventListener("click",async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;box.classList.remove("show")});
 box.querySelector("[data-install-close]")?.addEventListener("click",()=>box.classList.remove("show"));
}
