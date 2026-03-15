// =============================================
// PORTAL JAWA — script.js
// =============================================

// Set tanggal di topbar
function setDate() {
  const el = document.getElementById('topbarDate');
  if (!el) return;
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const now = new Date();
  el.textContent = hari[now.getDay()] + ', ' + now.getDate() + ' ' + bulan[now.getMonth()] + ' ' + now.getFullYear();
}

// Set tanggal di artikel
function setArticleDate() {
  const el = document.getElementById('articleDate');
  if (!el) return;
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const now = new Date();
  el.textContent = now.getDate() + ' ' + bulan[now.getMonth()] + ' ' + now.getFullYear();
}

// Share artikel
function shareArticle() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link berhasil disalin!');
    });
  }
}

// Subscribe newsletter
function subscribe() {
  const input = document.querySelector('.nl-input');
  if (!input) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    alert('Masukkan email yang valid!');
    return;
  }
  alert('Terima kasih! ' + email + ' berhasil didaftarkan.');
  input.value = '';
}

// INIT
document.addEventListener('DOMContentLoaded', function () {
  setDate();
  setArticleDate();
});
