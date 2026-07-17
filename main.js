// Service area map — key injected by build.sh at deploy time.
(function initServiceMap() {
  const mapEl = document.getElementById('serviceMap');
  if (!mapEl) return;

  const key = '__GOOGLE_MAPS_API_KEY__';
  if (!key || key.startsWith('__')) return; // placeholder not replaced — skip in dev/git

  window.__initMrBinMap = function () {
    const map = new google.maps.Map(mapEl, {
      center: { lat: 38.42, lng: -77.47 },
      zoom: 10,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      clickableIcons: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
      ],
    });

    // Hand-approximated polygon covering Stafford VA (22554) + Fredericksburg VA
    new google.maps.Polygon({
      paths: [
        { lat: 38.555, lng: -77.305 },
        { lat: 38.560, lng: -77.500 },
        { lat: 38.495, lng: -77.650 },
        { lat: 38.370, lng: -77.680 },
        { lat: 38.268, lng: -77.565 },
        { lat: 38.258, lng: -77.430 },
        { lat: 38.295, lng: -77.305 },
        { lat: 38.430, lng: -77.270 },
      ],
      strokeColor:   '#0B6B3A',
      strokeOpacity: 1.0,
      strokeWeight:  2,
      fillColor:     '#A6E22E',
      fillOpacity:   0.25,
      map,
    });
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=__initMrBinMap&loading=async`;
  script.async = true;
  document.head.appendChild(script);
})();

// Bin counter
let bins = 2;
const binCount  = document.getElementById('binCount');
const binsInput = document.getElementById('binsInput');

document.getElementById('decBins').addEventListener('click', () => {
  if (bins > 1) {
    bins--;
    binCount.textContent = bins;
    binsInput.value = bins;
  }
});

document.getElementById('incBins').addEventListener('click', () => {
  if (bins < 12) {
    bins++;
    binCount.textContent = bins;
    binsInput.value = bins;
  }
});

const form         = document.getElementById('bookingForm');
const successPanel = document.getElementById('bookingSuccess');
const successTitle = document.getElementById('successTitle');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // Show success screen immediately — bots see the same screen and learn nothing
  const firstName = String(data.get('name') || '').trim().split(' ')[0];
  successTitle.textContent = firstName ? `Thanks, ${firstName}!` : "Thanks — you're all set!";
  form.style.display  = 'none';
  successPanel.hidden = false;

  // POST real submission to the Worker
  try {
    await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:                    String(data.get('name')                    || '').trim(),
        phone:                   String(data.get('phone')                   || '').trim(),
        email:                   String(data.get('email')                   || '').trim(),
        address:                 String(data.get('address')                 || '').trim(),
        bins:                    String(data.get('bins')                    || '1'),
        date:                    String(data.get('date')                    || ''),
        notes:                   String(data.get('notes')                   || '').trim(),
      }),
    });
  } catch (err) {
    // Network errors are logged only — user already sees the success screen
    console.error('[mrbin] booking POST failed:', err);
  }
});
