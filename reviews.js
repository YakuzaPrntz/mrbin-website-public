/**
 * Reviews component.
 *
 * Each review is rendered from the REVIEWS array below into a self-contained
 * card. To add a review, append an object to the array — no markup or CSS
 * changes are needed.
 *
 * The DOM is deliberately shaped as viewport > track > cards, which is the
 * structure a carousel needs: the viewport clips, the track slides. Arrow or
 * swipe navigation can be added later by translating .reviews-track, without
 * restructuring anything here. No navigation logic is implemented yet.
 *
 * NOTE: index.html carries a <noscript> copy of the first review so the page
 * still shows social proof without JavaScript. If you change the first entry
 * below, update that block to match.
 */
(function () {
  'use strict';

  var REVIEWS = [
    {
      id: 'ken',
      name: 'Ken',
      rating: 5,
      source: 'Google Review',
      text: 'Called the team to confirm my appointment and they showed up promptly even when I had to push it to another day. These are hardworking young men and they did a great job in cleaning our bins! I would definitely recommend them and call them in the future!',
      photos: {
        before: {
          src: 'review-ken-before.jpg',
          width: 881,
          height: 1000,
          alt: "Inside of Ken's trash bin before cleaning, with caked-on grime and stuck debris at the bottom",
        },
        after: {
          src: 'review-ken-after.jpg',
          width: 750,
          height: 1000,
          alt: 'The same bin after cleaning, washed down to bare plastic with no debris left',
        },
      },
    },
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /** One before/after figure. */
  function buildPhoto(photo, label) {
    var figure = el('figure', 'review-photo');
    figure.appendChild(el('figcaption', 'review-photo-label', label));

    var img = el('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.width = photo.width;
    img.height = photo.height;
    img.loading = 'lazy';
    img.decoding = 'async';
    figure.appendChild(img);

    return figure;
  }

  /** One complete review card: stars, text, before/after pair, attribution. */
  function buildCard(review) {
    var card = el('article', 'review-card');

    var stars = el('div', 'review-stars');
    stars.setAttribute('aria-label', 'Rated ' + review.rating + ' out of 5');
    stars.appendChild(el('span', 'stars', '★★★★★'.slice(0, review.rating)));
    card.appendChild(stars);

    card.appendChild(el('blockquote', 'review-text', review.text));

    if (review.photos) {
      var photos = el('div', 'review-photos');
      photos.appendChild(buildPhoto(review.photos.before, 'Before'));
      photos.appendChild(buildPhoto(review.photos.after, 'After'));
      card.appendChild(photos);
    }

    var meta = el('div', 'review-meta');
    meta.appendChild(el('span', 'review-name', review.name));
    meta.appendChild(el('span', 'review-source', review.source));
    card.appendChild(meta);

    return card;
  }

  function render() {
    var track = document.getElementById('reviewsTrack');
    if (!track || !REVIEWS.length) return;

    var frag = document.createDocumentFragment();
    REVIEWS.forEach(function (review) {
      frag.appendChild(buildCard(review));
    });

    track.textContent = '';
    track.appendChild(frag);
    track.setAttribute('data-review-count', String(REVIEWS.length));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
