(function () {
  try {
    var t = localStorage.getItem('stable-theme')
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  } catch (_) {}
})()
