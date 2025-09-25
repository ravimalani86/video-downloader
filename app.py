from flask import Flask, render_template, request, url_for, redirect, session, jsonify
import instaloader
import os
import shutil
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
STATIC_DOWNLOADS = os.path.join("static", "downloads")

# ensure static downloads folder exists
os.makedirs(STATIC_DOWNLOADS, exist_ok=True)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        url = request.form.get("url")
        shortcode = url.split("/")[-2]

        # temporary download folder
        temp_dir = os.path.join("temp", shortcode)
        os.makedirs(temp_dir, exist_ok=True)

        loader = instaloader.Instaloader(
            download_comments=False,
            download_geotags=False,
            download_pictures=False,
            download_video_thumbnails=False,
            save_metadata=False,
            dirname_pattern=temp_dir
        )

        try:
            post = instaloader.Post.from_shortcode(loader.context, shortcode)
            loader.download_post(post, target=shortcode)

            # find mp4 inside temp folder
            video_file = None
            for root, _, files in os.walk(temp_dir):
                for f in files:
                    if f.endswith(".mp4"):
                        video_file = os.path.join(root, f)
                        break

            if video_file:
                final_name = f"{shortcode}.mp4"
                final_path = os.path.join(STATIC_DOWNLOADS, final_name)

                if os.path.exists(final_path):
                    os.remove(final_path)

                shutil.move(video_file, final_path)
                shutil.rmtree(temp_dir, ignore_errors=True)

                video_url = url_for("static", filename=f"downloads/{final_name}")
                session["preview"] = video_url
                return redirect(url_for("index"))

            else:
                session["error"] = "No video found for this link."
                return redirect(url_for("index"))

        except Exception as e:
            session["error"] = str(e)
            return redirect(url_for("index"))

    # GET request
    preview = session.pop("preview", None)
    error = session.pop("error", None)
    return render_template("index.html", preview=preview, error=error)

# ---------- New API route ----------
@app.route("/api/download", methods=["POST"])
def api_download():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"flag": False, "error": "URL not provided"}), 400

        url = data["url"]
        shortcode = url.split("/")[-2]

        temp_dir = os.path.join("temp", shortcode)
        os.makedirs(temp_dir, exist_ok=True)

        loader = instaloader.Instaloader(
            download_comments=False,
            download_geotags=False,
            download_pictures=False,
            download_video_thumbnails=False,
            save_metadata=False,
            dirname_pattern=temp_dir
        )

        post = instaloader.Post.from_shortcode(loader.context, shortcode)
        loader.download_post(post, target=shortcode)

        # find mp4 inside temp folder
        video_file = None
        for root, _, files in os.walk(temp_dir):
            for f in files:
                if f.endswith(".mp4"):
                    video_file = os.path.join(root, f)
                    break

        if video_file:
            final_name = f"{shortcode}.mp4"
            final_path = os.path.join(STATIC_DOWNLOADS, final_name)

            if os.path.exists(final_path):
                os.remove(final_path)

            shutil.move(video_file, final_path)
            shutil.rmtree(temp_dir, ignore_errors=True)

            video_url = url_for("static", filename=f"downloads/{final_name}", _external=True)
            return jsonify({"flag": True, "preview": video_url})

        else:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return jsonify({"flag": False, "error": "No video found for this link."})

    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return jsonify({"flag": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)