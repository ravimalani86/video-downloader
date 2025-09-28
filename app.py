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

@app.route("/api/instagram/download", methods=["POST"])
def api_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        instagram_url = data["url"]

        # ssvid.net API integration
        api_url = "https://ssvid.net/api/ajax/search?hl=en"
        headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://ssvid.net/en19/instagram-video-downloader"
        }
        data = {
            "query": instagram_url,
            "cf_token": "",
            "vt": "youtube"
        }
        response = requests.post(api_url, headers=headers, data=data)
        if not response.ok:
            return jsonify({"flag": False, "error": "Failed to fetch from ssvid.net"}), 500
        result = response.json()
        # Extract video and thumbnail URLs
        try:
            video_url = result['data']['links']['video']['HD video']['url']
        except Exception:
            video_url = None
        try:
            thumbnail_url = result['data']['thumbnail']
        except Exception:
            thumbnail_url = None
        flag = bool(video_url and thumbnail_url)

        return jsonify({
            "flag": flag,
            "videoUrl": video_url,
            "thumbnailUrl": thumbnail_url,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to scrape the SnapDownloader page: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)