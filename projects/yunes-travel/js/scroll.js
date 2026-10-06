document.addEventListener('DOMContentLoaded', () => {
  const b = document.querySelector('.backtop');
  if (!b) return;

  // passive: true لتحسين الأداء
  addEventListener('scroll', () => {
    b.classList.toggle('show', scrollY > 500);
  }, { passive: true });

  b.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: 'smooth' });
  });
});