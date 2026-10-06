document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const buttons = group.querySelectorAll('.filter-btn');
    // البحث فقط داخل نفس الحاوية (section) وليس كل الصفحة
    const container = group.closest('section') || group.closest('.container') || document;
    const cards = container.querySelectorAll('[data-filter-item]');

    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;

        cards.forEach(c => {
          const match = (f === 'all' || c.dataset.category === f);
          c.style.display = match ? '' : 'none';
        });
      });
    });
  });
});