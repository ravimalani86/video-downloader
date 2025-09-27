from flask import Flask, render_template, request, url_for, jsonify
import os
import secrets
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
STATIC_DOWNLOADS = os.path.join("static", "downloads")

# ensure static downloads folder exists
os.makedirs(STATIC_DOWNLOADS, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/download", methods=["POST"])
def api_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        url = data["url"]
        full_instagram_url = url if url.startswith("http") else f"https://{url}"
        snapdownloader_url = f"https://snapdownloader.com/tools/instagram-downloader/download?url={requests.utils.quote(full_instagram_url)}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        response = requests.get(snapdownloader_url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract video and thumbnail URLs
        download_links = soup.select('.download-item a.btn-download')
        video_url = download_links[0]['href'] if len(download_links) > 0 else None
        thumbnail_url = download_links[-1]['href'] if len(download_links) > 1 else None

        flag = bool(video_url and thumbnail_url)

        # Download thumbnail locally if available
        local_thumb_url = None
        if thumbnail_url:
            try:
                shortcode = None
                # Try to extract shortcode from video_url or request url
                if video_url:
                    parts = video_url.split('/')
                    for part in parts:
                        if len(part) == 11 and part.isalnum():
                            shortcode = part
                            break
                if not shortcode:
                    # fallback: try from input url
                    input_url = data["url"]
                    shortcode = input_url.split("/")[-2] if "/" in input_url else "thumb"
                thumb_name = f"{shortcode}_thumb.jpg"
                thumb_path = os.path.join(STATIC_DOWNLOADS, thumb_name)
                thumb_resp = requests.get(thumbnail_url, stream=True, timeout=10)
                if thumb_resp.status_code == 200:
                    with open(thumb_path, "wb") as f:
                        for chunk in thumb_resp.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                    local_thumb_url = url_for("static", filename=f"downloads/{thumb_name}")
            except Exception:
                local_thumb_url = None

        return jsonify({
            "flag": flag,
            "videoUrl": video_url,
            "thumbnailUrl": local_thumb_url or thumbnail_url
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to scrape the SnapDownloader page: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)