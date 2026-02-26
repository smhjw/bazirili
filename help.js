const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('.faq-q');
  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach((el) => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
