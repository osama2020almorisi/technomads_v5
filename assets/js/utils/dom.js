export const $=(s,c=document)=>c.querySelector(s);
export const $$=(s,c=document)=>[...c.querySelectorAll(s)];
export const on=(el,event,fn,opts)=>el?.addEventListener(event,fn,opts);
export const create=(tag,attrs={},children=[])=>{const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>k==="class"?e.className=v:k==="text"?e.textContent=v:e.setAttribute(k,v));children.forEach(x=>e.append(x));return e};
