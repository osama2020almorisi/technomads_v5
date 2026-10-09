export function initAccessibility(){
 document.querySelectorAll("[data-modal-open]").forEach(btn=>btn.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();btn.click()}}));
 document.querySelectorAll("[data-focus-trap]").forEach(modal=>modal.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const f=[...modal.querySelectorAll("button,a,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter(x=>!x.disabled);if(!f.length)return;if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}}))
}
