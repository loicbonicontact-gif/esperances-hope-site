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

// 3) Formulaire de contact : envoi sans quitter la page, et objet du message selon la catégorie
var formulaire = document.getElementById('formulaire-contact');
if (formulaire) {
  var objet = formulaire.querySelector('[name=_subject]');
  var statut = document.getElementById('form-statut');
  var bouton = formulaire.querySelector('button[type=submit]');

  // Quand on choisit une catégorie, elle apparaît dans l'objet de l'e-mail reçu
  formulaire.addEventListener('change', function (e) {
    if (e.target.name === 'categorie') {
      objet.value = '[Site] ' + e.target.value + ' - nouveau message';
    }
  });

  formulaire.addEventListener('submit', function (e) {
    // Vieux navigateur : on laisse l'envoi classique se faire
    if (!window.fetch || !window.FormData) { return; }
    e.preventDefault();
    bouton.disabled = true;
    statut.className = 'statut';
    statut.textContent = '…';
    fetch(formulaire.action, {
      method: 'POST',
      body: new FormData(formulaire),
      headers: { 'Accept': 'application/json' }
    }).then(function (reponse) {
      if (!reponse.ok) { throw new Error('envoi refusé'); }
      formulaire.reset();
      statut.className = 'statut ok';
      statut.textContent = formulaire.getAttribute('data-ok');
    }).catch(function () {
      statut.className = 'statut erreur';
      statut.textContent = formulaire.getAttribute('data-erreur');
    }).then(function () {
      bouton.disabled = false;
    });
  });
}

// 4) Visionneuse de photos : toucher une photo de la galerie l'ouvre en grand
var photos = document.querySelectorAll('.gallery figure img');
if (photos.length) {
  var anglais = document.documentElement.lang === 'en';
  var libelles = anglais
    ? { agrandir: 'Enlarge photo', fermer: 'Close', avant: 'Previous photo', apres: 'Next photo', titre: 'Photo viewer' }
    : { agrandir: 'Agrandir la photo', fermer: 'Fermer', avant: 'Photo précédente', apres: 'Photo suivante', titre: 'Visionneuse de photos' };

  // Chaque photo est entourée d'un bouton (clavier et lecteurs d'écran compris)
  var declencheurs = [];
  photos.forEach(function (photo, i) {
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'zoom';
    bouton.setAttribute('aria-label', libelles.agrandir + (photo.alt ? ' : ' + photo.alt : ''));
    photo.parentNode.insertBefore(bouton, photo);
    bouton.appendChild(photo);
    bouton.addEventListener('click', function () { ouvrir(i); });
    declencheurs.push(bouton);
  });

  var fleche = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var vue = document.createElement('div');
  vue.className = 'lightbox';
  vue.setAttribute('role', 'dialog');
  vue.setAttribute('aria-modal', 'true');
  vue.setAttribute('aria-label', libelles.titre);
  vue.innerHTML =
    '<button type="button" class="lb-btn lb-close" aria-label="' + libelles.fermer + '">' + fleche('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="' + libelles.avant + '">' + fleche('M15 5l-7 7 7 7') + '</button>' +
    '<img class="lb-img" alt="">' +
    '<button type="button" class="lb-btn lb-next" aria-label="' + libelles.apres + '">' + fleche('M9 5l7 7-7 7') + '</button>' +
    '<p class="lb-count" aria-live="polite"></p>';
  document.body.appendChild(vue);

  var image = vue.querySelector('.lb-img');
  var compteur = vue.querySelector('.lb-count');
  var boutons = vue.querySelectorAll('.lb-btn');
  var courante = 0;

  function montrer(i) {
    courante = (i + photos.length) % photos.length;
    image.src = photos[courante].currentSrc || photos[courante].src;
    image.alt = photos[courante].alt;
    compteur.textContent = (courante + 1) + ' / ' + photos.length;
  }
  function ouvrir(i) {
    montrer(i);
    vue.classList.add('open');
    document.body.classList.add('lb-lock');   // la page derrière ne défile plus
    vue.querySelector('.lb-close').focus();
  }
  function fermer() {
    vue.classList.remove('open');
    document.body.classList.remove('lb-lock');
    declencheurs[courante].focus();           // le focus revient sur la photo ouverte
  }

  vue.querySelector('.lb-close').addEventListener('click', fermer);
  vue.querySelector('.lb-prev').addEventListener('click', function () { montrer(courante - 1); });
  vue.querySelector('.lb-next').addEventListener('click', function () { montrer(courante + 1); });
  // Un clic à côté de la photo ferme aussi
  vue.addEventListener('click', function (e) { if (e.target === vue) { fermer(); } });

  // Clavier : Échap ferme, flèches changent de photo, Tab reste dans la visionneuse
  document.addEventListener('keydown', function (e) {
    if (!vue.classList.contains('open')) { return; }
    if (e.key === 'Escape') { fermer(); }
    else if (e.key === 'ArrowLeft') { montrer(courante - 1); }
    else if (e.key === 'ArrowRight') { montrer(courante + 1); }
    else if (e.key === 'Tab') {
      var premier = boutons[0], dernier = boutons[boutons.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    }
  });

  // Téléphone : balayer vers la gauche ou la droite change de photo
  var departX = null;
  vue.addEventListener('touchstart', function (e) { departX = e.changedTouches[0].clientX; }, { passive: true });
  vue.addEventListener('touchend', function (e) {
    if (departX === null) { return; }
    var ecart = e.changedTouches[0].clientX - departX;
    departX = null;
    if (Math.abs(ecart) > 50) { montrer(courante + (ecart < 0 ? 1 : -1)); }
  }, { passive: true });
}
