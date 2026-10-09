export function initAnimations(){
 const els=[...document.querySelectorAll("[data-animate]")];if(!els.length)return;
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");obs.unobserve(e.target)}}),{threshold:.12});
 els.forEach(x=>obs.observe(x));
}
