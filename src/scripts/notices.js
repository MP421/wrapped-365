document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelector('.notice').style.transform = 'translate(-50%, 0)';
  }, 5000);
});

document.querySelector('.close-banner').addEventListener('click', () => {
  document.querySelector('.notice').style.transform = 'translate(-50%, 540px)';
});

document.querySelector('.features').addEventListener('click', () => {
  document.querySelector('.features-open').style.display = 'flex';
});

document.querySelector('.about').addEventListener('click', () => {
  document.querySelector('.about-open').style.display = 'flex';
});

document.querySelector('.privacy-policy').addEventListener('click', () => {
  document.querySelector('.privacy-policy-notice').style.display = 'flex';
});

document.querySelector('.privacy-policy-pop').addEventListener('click', () => {
  document.querySelector('.privacy-policy-notice').style.display = 'flex';
});

document.querySelectorAll('.close-privacy-notice').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.features-open').style.display = 'none';
    document.querySelector('.about-open').style.display = 'none';
    document.querySelector('.privacy-policy-notice').style.display = 'none';
  });
});