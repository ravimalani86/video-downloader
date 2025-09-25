import sys, os

# make sure Python can find your project
sys.path.insert(0, os.path.dirname(__file__))

from app import app as application
