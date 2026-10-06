document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const items = [...slider.querySelectorAll('.slide')];
    if (items.length < 2) return;

    let i = 0;
    let timer = null;
    const INTERVAL = 4500;

    items.forEach((x, n) => {
      x.hidden = n !== 0;
      x.style.transition = 'opacity .5s ease';
    });

    function show(n) {
      items[i].hidden = true;
      i = (n + items.length) % items.length;
      items[i].hidden = false;
    }

    function start() {
      if (timer) return;
      timer = setInterval(() => show(i + 1), INTERVAL);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    start();

    // إيقاف عند مرور الماوس
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    // إيقاف عند مغادرة الصفحة (توفير موارد)
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  });
});