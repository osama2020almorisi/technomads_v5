export function initCounters(){
 const items=[...document.querySelectorAll("[data-counter]")];if(!items.length)return;
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,target=Number(el.dataset.counter)||0,duration=1100,start=performance.now();const tick=now=>{const p=Math.min((now-start)/duration,1);el.textContent=Math.floor((1-Math.pow(1-p,3))*target).toLocaleString();if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);obs.unobserve(el)}),{threshold:.5});items.forEach(x=>obs.observe(x));
}
