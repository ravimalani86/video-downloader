const fbForm = document.getElementById('facebookDownloadForm');
const fbLoader = document.getElementById('facebookLoader');
const fbErrorBox = document.getElementById('facebookErrorBox');
const fbPreviewBox = document.getElementById('facebookPreviewBox');

// Burger menu functionality
const burger = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    burger.classList.toggle('open');
    // Optionally change icon
    const icon = burger.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });
}

fbForm.addEventListener('submit', function(e) {
  e.preventDefault();
  fbErrorBox.style.display = 'none';
  fbPreviewBox.style.display = 'block';
  fbPreviewBox.innerHTML = `
    <h3>Preview</h3>
    <div class="shimmer shimmer-text"></div>
    <div class="shimmer shimmer-image"></div>
    <div class="shimmer shimmer-button"></div>
  `;
  fbLoader.style.display = 'block';
  const url = document.getElementById('facebookUrlInput').value.trim();
  fetch('/api/facebook/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  .then(res => res.json())
  .then(data => {
    fbLoader.style.display = 'none';
    if (!data.flag || !data.videoUrl) {
      fbErrorBox.textContent = '❌ ' + (data.error || 'No downloadable video found for this link.');
      fbErrorBox.style.display = 'block';
      fbPreviewBox.style.display = 'none';
    } else {
      fbPreviewBox.innerHTML = `
        <h3>Preview</h3>
        ${data.title ? `<h4 style="color: #4267B2; margin-bottom: 12px;">${data.title}</h4>` : ''}
        ${data.thumbnailUrl ? `
          <div class="image-container">
            <div class="image-placeholder" id="fbImagePlaceholder">
              <div class="loading-spinner"></div>
              Loading image...
            </div>
            <img id='fbThumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;display:none;" />
          </div>
        ` : ''}
        <br>
        <a href="${data.videoUrl}" download>⬇️ Download Video</a>
      `;
      fbPreviewBox.style.display = 'block';
      fbErrorBox.style.display = 'none';

      // Handle image loading states
      const thumbImg = document.getElementById('fbThumbImg');
      const imagePlaceholder = document.getElementById('fbImagePlaceholder');
      
      if (thumbImg && imagePlaceholder) {
        thumbImg.onload = function() {
          // Image loaded successfully
          imagePlaceholder.style.display = 'none';
          thumbImg.style.display = 'block';
          thumbImg.classList.add('image-loaded');
        };
        
        thumbImg.onerror = function() {
          // Image failed to load
          imagePlaceholder.innerHTML = `
            <div style="text-align: center; color: #666;">
              <i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
              Image not available
            </div>
          `;
          imagePlaceholder.classList.add('image-error');
        };
      }
    }
  })
  .catch(() => {
    fbLoader.style.display = 'none';
    fbErrorBox.textContent = '❌ Failed to connect to server.';
    fbErrorBox.style.display = 'block';
    fbPreviewBox.style.display = 'none';
  });
});
