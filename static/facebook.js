const fbForm = document.getElementById('facebookDownloadForm');
const fbLoader = document.getElementById('facebookLoader');
const fbErrorBox = document.getElementById('facebookErrorBox');
const fbPreviewBox = document.getElementById('facebookPreviewBox');

fbForm.addEventListener('submit', function(e) {
  e.preventDefault();
  fbErrorBox.style.display = 'none';
  fbPreviewBox.style.display = 'none';
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
        <h3>Video Preview</h3>
        ${data.thumbnailUrl ? `<img id='fbThumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;" />` : ''}
        <video id='fbVideoPreview' controls poster="${data.thumbnailUrl || ''}">
          <source src="${data.videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <br>
        <a href="${data.videoUrl}" download>⬇️ Download Video</a>
      `;
      fbPreviewBox.style.display = 'block';
      fbErrorBox.style.display = 'none';

      // If thumbnail fails to load, hide it and show video as main preview
      const thumbImg = document.getElementById('fbThumbImg');
      if (thumbImg) {
        thumbImg.onerror = function() {
          thumbImg.style.display = 'none';
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
