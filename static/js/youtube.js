const youtubeForm = document.getElementById('youtubeDownloadForm');
const youtubeLoader = document.getElementById('youtubeLoader');
const youtubeErrorBox = document.getElementById('youtubeErrorBox');
const youtubePreviewBox = document.getElementById('youtubePreviewBox');

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

youtubeForm.addEventListener('submit', function(e) {
  e.preventDefault();
  youtubeErrorBox.style.display = 'none';
  youtubePreviewBox.style.display = 'block';
  youtubePreviewBox.innerHTML = `
    <h3>Preview</h3>
    <div class="shimmer shimmer-text"></div>
    <div class="shimmer shimmer-image"></div>
    <div class="shimmer shimmer-button"></div>
  `;
  youtubeLoader.style.display = 'block';
  const url = document.getElementById('youtubeUrlInput').value.trim();
  fetch('/api/youtube/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  .then(res => res.json())
  .then(data => {
    youtubeLoader.style.display = 'none';
    if (!data.flag || !data.videoFormats || data.videoFormats.length === 0) {
      youtubeErrorBox.textContent = '❌ ' + (data.error || 'No downloadable video found for this link.');
      youtubeErrorBox.style.display = 'block';
      youtubePreviewBox.style.display = 'none';
    } else {
      // Create download table HTML
      let downloadTableHTML = `
        <table class="download-table">
          <thead>
            <tr>
              <th>Format</th>
              <th>Quality</th>
              <th>File Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.videoFormats.forEach((format, index) => {
        const formatClass = `format-${format.ext.toLowerCase()}`;
        downloadTableHTML += `
          <tr class="${formatClass}">
            <td><span class="format-badge">${format.format}</span></td>
            <td><span class="quality-badge">${format.quality}</span></td>
            <td>${format.size}</td>
            <td><button class="convert-btn" onclick="convertVideo('${format.key}', '${format.ext}', '${format.quality}', this)">Convert</button></td>
          </tr>
        `;
      });
      
      downloadTableHTML += `
          </tbody>
        </table>
      `;
      
      // Store video ID for conversion
      if (data.result && data.result.vid) {
        setCurrentVideoId(data.result.vid);
      }
      
      youtubePreviewBox.innerHTML = `
        <h3>Preview</h3>
        ${data.title ? `<h4 style="color: #FF0000; margin-bottom: 12px;">${data.title}</h4>` : ''}
        ${data.thumbnailUrl ? `
          <div class="image-container">
            <div class="image-placeholder" id="youtubeImagePlaceholder">
              <div class="loading-spinner"></div>
              Loading image...
            </div>
            <img id='youtubeThumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;display:none;" />
            ${data.duration ? `<div class="duration-info">⏱️ Duration: ${data.duration}</div>` : ''}
          </div>
        ` : ''}
        ${downloadTableHTML}
      `;
      youtubePreviewBox.style.display = 'block';
      youtubeErrorBox.style.display = 'none';

      // Handle image loading states
      const thumbImg = document.getElementById('youtubeThumbImg');
      const imagePlaceholder = document.getElementById('youtubeImagePlaceholder');
      
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
    youtubeLoader.style.display = 'none';
    youtubeErrorBox.textContent = '❌ Failed to connect to server.';
    youtubeErrorBox.style.display = 'block';
    youtubePreviewBox.style.display = 'none';
  });
});

// Convert function for YouTube videos
function convertVideo(key, ext, quality, buttonElement) {
  // Show loading state
  buttonElement.textContent = 'Converting...';
  buttonElement.disabled = true;
  buttonElement.classList.add('converting');
  
  // Get video ID from the current page data (you might need to store this globally)
  const videoId = getCurrentVideoId(); // This should be set when the page loads
  
  fetch('/api/youtube/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      video_id: videoId,
      key: key 
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.flag && data.downloadUrl) {
      // Conversion successful, hide convert button and show download button
      buttonElement.style.display = 'none';
      const downloadBtn = document.createElement('a');
      downloadBtn.href = data.downloadUrl;
      downloadBtn.download = true;
      downloadBtn.className = 'download-btn';
      downloadBtn.textContent = 'Download';
      buttonElement.parentNode.appendChild(downloadBtn);
    } else {
      // Conversion failed
      buttonElement.textContent = 'Convert Failed';
      buttonElement.disabled = false;
      buttonElement.classList.remove('converting');
      buttonElement.classList.add('error');
    }
  })
  .catch(() => {
    buttonElement.textContent = 'Convert Failed';
    buttonElement.disabled = false;
    buttonElement.classList.remove('converting');
    buttonElement.classList.add('error');
  });
}

// Store video ID globally for conversion
let currentVideoId = null;

function setCurrentVideoId(videoId) {
  currentVideoId = videoId;
}

function getCurrentVideoId() {
  return currentVideoId;
}
