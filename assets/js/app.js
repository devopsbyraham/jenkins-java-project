// Simple interactivity hooks (expandable for real data)
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for horizontal rows
  document.querySelectorAll('.cards--scroll').forEach(row => {
    let isDown = false, startX = 0, scrollLeft = 0;
    row.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - row.offsetLeft; scrollLeft = row.scrollLeft; });
    row.addEventListener('mouseleave', () => isDown = false);
    row.addEventListener('mouseup', () => isDown = false);
    row.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - row.offsetLeft;
      row.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  });

  // Card button demos
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.icon.play')) {
      alert('Play clicked');
    } else if (e.target.closest('.icon.add')) {
      alert('Added to your list');
    }
  });
});
