import secrets
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(16)
    STATIC_DOWNLOADS = os.path.join('static', 'downloads')
