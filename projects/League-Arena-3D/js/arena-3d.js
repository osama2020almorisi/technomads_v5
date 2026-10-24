
(function(){
  'use strict';
  const hero=document.getElementById('arenaHero');
  if(!hero) return;
  const updateStats=()=>{
    try{
      const data=window.Core?.State?.data||{};
      const teams=Array.isArray(data.teams)?data.teams:[];
      const matches=Array.isArray(data.matches)?data.matches:[];
      const goals=matches.reduce((sum,m)=>sum+(Number(m.homeScore)||Number(m.home_score)||0)+(Number(m.awayScore)||Number(m.away_score)||0),0);
      document.getElementById('arenaTeamCount').textContent=teams.length;
      document.getElementById('arenaMatchCount').textContent=matches.length;
      document.getElementById('arenaGoalCount').textContent=goals;
    }catch(e){document.getElementById('arenaTeamCount').textContent='0';document.getElementById('arenaMatchCount').textContent='0';document.getElementById('arenaGoalCount').textContent='0';}
  };
  const updateVisibility=()=>{
    const page=window.Core?.State?.get?.('currentPage')||'home';
    hero.hidden=page!=='home';
  };
  const scene=document.getElementById('arenaScene');
  if(scene && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    scene.addEventListener('pointermove',e=>{
      const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      const stadium=scene.querySelector('.arena-stadium');
      if(stadium) stadium.style.transform=`rotateX(${57-y*7}deg) rotateZ(${-28+x*7}deg) translateY(-3%)`;
    });
    scene.addEventListener('pointerleave',()=>{const s=scene.querySelector('.arena-stadium');if(s)s.style.transform='rotateX(57deg) rotateZ(-28deg) translateY(-3%)';});
  }
  document.addEventListener('league:route',updateVisibility);
  document.addEventListener('league:data-changed',updateStats);
  document.addEventListener('DOMContentLoaded',()=>{updateStats();updateVisibility();});
  const oldSet=window.UI?.ThemeManager?.set;
  if(oldSet&&!window.UI.ThemeManager.__arenaWrapped){
    window.UI.ThemeManager.set=function(theme){const result=oldSet.call(this,theme);document.documentElement.dataset.theme=theme;return result;};
    window.UI.ThemeManager.__arenaWrapped=true;
  }
  setTimeout(()=>{updateStats();updateVisibility();},700);
})();
