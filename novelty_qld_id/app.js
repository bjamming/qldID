// app.js - main interactivity
(function(){
  // Elements
  const nameInput = document.getElementById('nameInput');
  const titleInput = document.getElementById('titleInput');
  const colorInput = document.getElementById('colorInput');
  const colorHex = document.getElementById('colorHex');
  const qrInput = document.getElementById('qrInput');
  const displayName = document.getElementById('displayName');
  const displayTitle = document.getElementById('displayTitle');
  const displayColorName = document.getElementById('displayColorName');
  const qrcodeEl = document.getElementById('qrcode');
  const card = document.getElementById('card');
  const flipBtn = document.getElementById('flipBtn');
  const randomBtn = document.getElementById('randomBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const installBtn = document.getElementById('installBtn');

  // QR code generator
  let qr;
  function initQR(text){
    qrcodeEl.innerHTML = '';
    qr = new QRCode(qrcodeEl, {
      text: text || qrInput.value || 'novelty',
      width: 84,
      height: 84,
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // Initialize
  function init(){
    updateFromInputs();
    initQR(qrInput.value);
  }

  // Update visuals
  function updateFromInputs(){
    displayName.textContent = nameInput.value || 'Unnamed';
    displayTitle.textContent = titleInput.value || 'Fun Title';
    colorHex.textContent = colorInput.value;
    displayColorName.textContent = colorInput.value;
    // apply accent color to various UI bits
    document.documentElement.style.setProperty('--novelty-color', colorInput.value);
    // set small gradient for card front (simple)
    const front = document.querySelector('.card-front');
    if(front) front.style.background = `linear-gradient(135deg, ${hexToRgba(colorInput.value,0.08)}, ${hexToRgba('#0b4f6c',0.03)})`;
    // regenerate QR whose payload uses the qrInput (plus name)
    const payload = qrInput.value || `novelty:${nameInput.value}|${titleInput.value}`;
    initQR(payload);
  }

  function hexToRgba(hex, alpha=1){
    const h = hex.replace('#','');
    const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h,16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Flip
  flipBtn.addEventListener('click', ()=> {
    card.classList.toggle('is-flipped');
  });

  // Input listeners
  [nameInput, titleInput, colorInput, qrInput].forEach(el=>{
    el.addEventListener('input', updateFromInputs);
  });

  // Randomise
  randomBtn.addEventListener('click', ()=> {
    const names = ['Indie Star', 'Mia Reef', 'Kai Shore', 'Riley Tide', 'Sammy Reef'];
    const titles = ['Beach Ranger','Sun Chaser','Coral Custodian','Sand Inspector','Seashell Curator'];
    const colors = ['#2fb3ad','#ff6b6b','#6c5ce7','#00b3ff','#ffb86b'];
    nameInput.value = names[Math.floor(Math.random()*names.length)];
    titleInput.value = titles[Math.floor(Math.random()*titles.length)];
    colorInput.value = colors[Math.floor(Math.random()*colors.length)];
    qrInput.value = `novelty:${nameInput.value}|${titleInput.value}`;
    updateFromInputs();
  });

  resetBtn.addEventListener('click', ()=> {
    nameInput.value = 'Ben Greatz';
    titleInput.value = 'Beach Ranger';
    colorInput.value = '#2fb3ad';
    qrInput.value = 'novelty:Ben Greatz|Beach Ranger';
    updateFromInputs();
  });

  // Download / export as image
  downloadBtn.addEventListener('click', async ()=>{
    // temporarily remove glare/watermark animation for crisp capture if you want
    const el = document.getElementById('cardShell');
    try{
      const canvas = await html2canvas(el, {scale:2, useCORS:true, backgroundColor:null});
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = (nameInput.value || 'novelty-card').replace(/\s+/g,'_') + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }catch(err){
      alert('Export failed: ' + err.message);
    }
  });

  // Share (Web Share API)
  shareBtn.addEventListener('click', async ()=>{
    if(navigator.share){
      try{
        // create an image blob then share
        const canvas = await html2canvas(document.getElementById('cardShell'),{scale:2});
        const blob = await new Promise(res=>canvas.toBlob(res,'image/png'));
        const filesArray = [new File([blob], 'novelty-card.png', { type: 'image/png' })];
        await navigator.share({files: filesArray, title: 'Novelty ID', text: 'Novely ID — not real' });
      }catch(e){
        alert('Share failed: ' + e.message);
      }
    } else {
      alert('Web Share not supported on this device — try downloading instead.');
    }
  });

  // Install button (PWA prompt)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = '';
  });

  installBtn.addEventListener('click', async ()=>{
    if(deferredPrompt){
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }else{
      alert('Install: Use Safari -> Share -> Add to Home Screen (on iPhone).');
    }
  });

  // simple avatar cycling on photo click
  const photoArea = document.getElementById('photoArea');
  const avatars = ['👤','🧑‍🌾','🏄‍♂️','🧜‍♀️','🕶️','🌊'];
  let avatarIndex = 0;
  photoArea.addEventListener('click', ()=> {
    avatarIndex = (avatarIndex+1) % avatars.length;
    photoArea.textContent = avatars[avatarIndex];
  });

  // initial setup
  init();

  // register service worker for PWA caching
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').catch(()=>{/* ignore */});
  }
})();
