from flask import Blueprint, render_template, request, jsonify
from video_downloader.services.instagram_service import download_instagram_video
from video_downloader.services.facebook_service import download_facebook_video
from video_downloader.services.linkedin_service import download_linkedin_video
from video_downloader.services.twitter_service import download_twitter_video
from video_downloader.services.youtube_service import download_youtube_video, convert_youtube_video

routes = Blueprint('routes', __name__)

@routes.route("/")
def index():
    return render_template("instagram.html")

@routes.route("/facebook")
def facebook():
    return render_template("facebook.html")

@routes.route("/linkedin")
def linkedin():
    return render_template("linkedin.html")

@routes.route("/twitter")
def twitter():
    return render_template("twitter.html")

@routes.route("/youtube")
def youtube():
    return render_template("youtube.html")

@routes.route("/api/instagram/download", methods=["POST"])
def api_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        instagram_url = data["url"]
        video_url, thumbnail_url, title, result, flag = download_instagram_video(instagram_url)
        return jsonify({
            "flag": flag,
            "videoUrl": video_url,
            "thumbnailUrl": thumbnail_url,
            "title": title,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})

@routes.route("/api/facebook/download", methods=["POST"])
def api_facebook_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        facebook_url = data["url"]
        video_url, thumbnail_url, title, result, flag = download_facebook_video(facebook_url)
        return jsonify({
            "flag": flag,
            "videoUrl": video_url,
            "thumbnailUrl": thumbnail_url,
            "title": title,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})

@routes.route("/api/linkedin/download", methods=["POST"])
def api_linkedin_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        linkedin_url = data["url"]
        video_url, thumbnail_url, title, result, flag = download_linkedin_video(linkedin_url)
        return jsonify({
            "flag": flag,
            "videoUrl": video_url,
            "thumbnailUrl": thumbnail_url,
            "title": title,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})

@routes.route("/api/twitter/download", methods=["POST"])
def api_twitter_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        twitter_url = data["url"]
        video_formats, thumbnail_url, title, result, flag = download_twitter_video(twitter_url)
        return jsonify({
            "flag": flag,
            "videoFormats": video_formats,
            "thumbnailUrl": thumbnail_url,
            "title": title,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})

@routes.route("/api/youtube/download", methods=["POST"])
def api_youtube_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        youtube_url = data["url"]
        video_formats, thumbnail_url, title, duration, result, flag = download_youtube_video(youtube_url)
        return jsonify({
            "flag": flag,
            "videoFormats": video_formats,
            "thumbnailUrl": thumbnail_url,
            "title": title,
            "duration": duration,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})

@routes.route("/api/youtube/convert", methods=["POST"])
def api_youtube_convert():
    try:
        data = request.get_json()
        if not data or "video_id" not in data or "key" not in data:
            return jsonify({"flag": False, "error": "Video ID and key not provided"}), 400

        video_id = data["video_id"]
        key = data["key"]
        download_url, status, title, result, flag = convert_youtube_video(video_id, key)
        return jsonify({
            "flag": flag,
            "downloadUrl": download_url,
            "status": status,
            "title": title,
            "result": result
        })
    except Exception as e:
        return jsonify({"flag": False, "error": f"Failed to process request: {str(e)}"})
