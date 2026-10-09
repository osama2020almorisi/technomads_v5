export function initSearch(){
 const input=document.querySelector("[data-search]");if(!input)return;const items=[...document.querySelectorAll("[data-search-item]")];input.addEventListener("input",()=>{const q=input.value.trim().toLowerCase();items.forEach(x=>x.hidden=q&&!x.textContent.toLowerCase().includes(q))})
}
