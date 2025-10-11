import requests

def download_linkedin_video(linkedin_url):
    api_url = "https://ssvid.app/api/ajax/search"
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://ssvid.app/linkedin-video-downloader"
    }
    data = {
        "query": linkedin_url,
        "cf_token": "",
        "vt": "linkedin"
    }
    response = requests.post(api_url, headers=headers, data=data)
    if not response.ok:
        raise Exception("Failed to fetch from ssvid.app")
    result = response.json()
    
    try:
        # Try to get the highest quality video (last in the array)
        video_links = result['data']['links']['video']
        if video_links:
            # Get the highest quality video (usually the last one)
            video_url = video_links[-1]['url']
        else:
            video_url = None
    except Exception:
        video_url = None
    
    try:
        thumbnail_url = result['data']['thumbnail']
    except Exception:
        thumbnail_url = None
    
    try:
        title = result['data']['title']
    except Exception:
        title = None
    
    flag = bool(video_url and thumbnail_url)
    return video_url, thumbnail_url, title, result, flag
