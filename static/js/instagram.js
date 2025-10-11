const form = document.getElementById('downloadForm');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');
const previewBox = document.getElementById('previewBox');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  errorBox.style.display = 'none';
  previewBox.style.display = 'block';
  previewBox.innerHTML = `
    <h3>Preview</h3>
    <div class="shimmer shimmer-text"></div>
    <div class="shimmer shimmer-image"></div>
    <div class="shimmer shimmer-button"></div>
  `;
  loader.style.display = 'block';
  const url = document.getElementById('urlInput').value.trim();
  fetch('/api/instagram/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  .then(res => res.json())
  .then(data => {
    loader.style.display = 'none';
    if (!data.flag || !data.videoUrl) {
      errorBox.textContent = '❌ ' + (data.error || 'No downloadable video found for this link.');
      errorBox.style.display = 'block';
      previewBox.style.display = 'none';
    } else {
      previewBox.innerHTML = `
        <h3>Preview</h3>
        ${data.title ? `<h4 style="color: #E1306C; margin-bottom: 12px;">${data.title}</h4>` : ''}
        ${data.thumbnailUrl ? `
          <div class="image-container">
            <div class="image-placeholder" id="imagePlaceholder">
              <div class="loading-spinner"></div>
              Loading image...
            </div>
            <img id='thumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;display:none;" />
          </div>
        ` : ''}
        <br>
        <a href="${data.videoUrl}" download>⬇️ Download Video</a>
      `;
      previewBox.style.display = 'block';
      errorBox.style.display = 'none';

      // Handle image loading states
      const thumbImg = document.getElementById('thumbImg');
      const imagePlaceholder = document.getElementById('imagePlaceholder');
      
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
    loader.style.display = 'none';
    errorBox.textContent = '❌ Failed to connect to server.';
    errorBox.style.display = 'block';
    previewBox.style.display = 'none';
  });
});

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