const form = document.getElementById('downloadForm');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');
const previewBox = document.getElementById('previewBox');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  errorBox.style.display = 'none';
  previewBox.style.display = 'none';
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
        <h3>Video Preview</h3>
        ${data.thumbnailUrl ? `<img id='thumbImg' src="${data.thumbnailUrl}" alt="Thumbnail" style="max-width:300px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.1);margin-bottom:12px;" />` : ''}
        <video id='videoPreview' controls poster="${data.thumbnailUrl || ''}">
          <source src="${data.videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <br>
        <a href="${data.videoUrl}" download>⬇️ Download Video</a>
      `;
      previewBox.style.display = 'block';
      errorBox.style.display = 'none';

      // If thumbnail fails to load, hide it and show video as main preview
      const thumbImg = document.getElementById('thumbImg');
      if (thumbImg) {
        thumbImg.onerror = function() {
          thumbImg.style.display = 'none';
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
