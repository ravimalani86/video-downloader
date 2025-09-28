from flask import Flask
from video_downloader.config import Config
from video_downloader.routes import routes
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = app.config['SECRET_KEY']

    # Ensure static downloads folder exists
    os.makedirs(app.config['STATIC_DOWNLOADS'], exist_ok=True)

    # Register blueprints
    app.register_blueprint(routes)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)