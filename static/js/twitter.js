const twitterForm = document.getElementById('twitterDownloadForm');
const twitterLoader = document.getElementById('twitterLoader');
const twitterErrorBox = document.getElementById('twitterErrorBox');
const twitterPreviewBox = document.getElementById('twitterPreviewBox');

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

twitterForm.addEventListener('submit', function(e) {
  e.preventDefault();
  twitterErrorBox.style.display = 'none';
  twitterPreviewBox.style.display = 'block';
  twitterPreviewBox.innerHTML = `
    <h3>Preview</h3>
    <div class="shimmer shimmer-text"></div>
    <div class="shimmer shimmer-image"></div>
    <div class="shimmer shimmer-button"></div>
  `;
  twitterLoader.style.display = 'block';
  const url = document.getElementById('twitterUrlInput').value.trim();
  fetch('/api/twitter/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  .then(res => res.json())
  .then(data => {
    twitterLoader.style.display = 'none';
    if (!data.flag || !data.videoFormats || data.videoFormats.length === 0) {
      twitterErrorBox.textContent = '❌ ' + (data.error || 'No downloadable video found for this link.');
      twitterErrorBox.style.display = 'block';
      twitterPreviewBox.style.display = 'none';
    } else {
      // Create download table HTML
      let downloadTableHTML = `
        <table class="download-table">
          <thead>
            <tr>
              <th>File Type</th>
              <th>Resolution</th>
              <th>File Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.videoFormats.forEach((format, index) => {
        downloadTableHTML += `
          <tr>
            <td>${format.ext.toUpperCase()}</td>
            <td><span class="resolution-badge">${format.resolution}</span></td>
            <td>${format.size}</td>
            <td><a href="${format.url}" download class="download-btn">Download</a></td>
          </tr>
        `;
      });
      
      downloadTableHTML += `
          </tbody>
        </table>
      `;
      
      twitterPreviewBox.innerHTML = `
        <h3>Preview</h3>
        ${data.title ? `<h4 style="color: #1DA1F2; margin-bottom: 12px;">${data.title}</h4>` : ''}
        ${data.thumbnailUrl ? `
          <div class="image-container">
            <div class="image-placeholder" id="twitterImagePlaceholder">
              <div class="loading-spinner"></div>
              Loading image...
            </div>
            <img id='twitterThumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;display:none;" />
          </div>
        ` : ''}
        ${downloadTableHTML}
      `;
      twitterPreviewBox.style.display = 'block';
      twitterErrorBox.style.display = 'none';

      // Handle image loading states
      const thumbImg = document.getElementById('twitterThumbImg');
      const imagePlaceholder = document.getElementById('twitterImagePlaceholder');
      
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
    twitterLoader.style.display = 'none';
    twitterErrorBox.textContent = '❌ Failed to connect to server.';
    twitterErrorBox.style.display = 'block';
    twitterPreviewBox.style.display = 'none';
  });
});
