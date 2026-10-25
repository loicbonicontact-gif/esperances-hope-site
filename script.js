// Petit script du site : menu sur téléphone + apparition douce des sections.

// 1) Menu sur téléphone : le bouton ouvre et ferme la liste des liens
var burger = document.querySelector('.burger');
var menu = document.getElementById('menu');

if (burger && menu) {
  burger.addEventListener('click', function () {
    var ouvert = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
  // On referme le menu quand on clique sur un lien
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

// 2) Les blocs « reveal » apparaissent quand on les voit à l'écran
var blocs = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) {
        entree.target.classList.add('visible');
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.12 });
  blocs.forEach(function (bloc) { observateur.observe(bloc); });
} else {
  // Vieux navigateur : on affiche tout directement
  blocs.forEach(function (bloc) { bloc.classList.add('visible'); });
}
