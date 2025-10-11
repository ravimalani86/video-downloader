const linkedinForm = document.getElementById('linkedinDownloadForm');
const linkedinLoader = document.getElementById('linkedinLoader');
const linkedinErrorBox = document.getElementById('linkedinErrorBox');
const linkedinPreviewBox = document.getElementById('linkedinPreviewBox');

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

linkedinForm.addEventListener('submit', function(e) {
  e.preventDefault();
  linkedinErrorBox.style.display = 'none';
  linkedinPreviewBox.style.display = 'block';
  linkedinPreviewBox.innerHTML = `
    <h3>Preview</h3>
    <div class="shimmer shimmer-text"></div>
    <div class="shimmer shimmer-image"></div>
    <div class="shimmer shimmer-button"></div>
  `;
  linkedinLoader.style.display = 'block';
  const url = document.getElementById('linkedinUrlInput').value.trim();
  fetch('/api/linkedin/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  .then(res => res.json())
  .then(data => {
    linkedinLoader.style.display = 'none';
    if (!data.flag || !data.videoUrl) {
      linkedinErrorBox.textContent = '❌ ' + (data.error || 'No downloadable video found for this link.');
      linkedinErrorBox.style.display = 'block';
      linkedinPreviewBox.style.display = 'none';
    } else {
      linkedinPreviewBox.innerHTML = `
        <h3>Preview</h3>
        ${data.title ? `<h4 style="color: #0077B5; margin-bottom: 12px;">${data.title}</h4>` : ''}
        ${data.thumbnailUrl ? `
          <div class="image-container">
            <div class="image-placeholder" id="linkedinImagePlaceholder">
              <div class="loading-spinner"></div>
              Loading image...
            </div>
            <img id='linkedinThumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;display:none;" />
          </div>
        ` : ''}
        <br>
        <a href="${data.videoUrl}" download>⬇️ Download Video</a>
      `;
      linkedinPreviewBox.style.display = 'block';
      linkedinErrorBox.style.display = 'none';

      // Handle image loading states
      const thumbImg = document.getElementById('linkedinThumbImg');
      const imagePlaceholder = document.getElementById('linkedinImagePlaceholder');
      
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
    linkedinLoader.style.display = 'none';
    linkedinErrorBox.textContent = '❌ Failed to connect to server.';
    linkedinErrorBox.style.display = 'block';
    linkedinPreviewBox.style.display = 'none';
  });
});
