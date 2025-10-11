import requests

def download_twitter_video(twitter_url):
    api_url = "https://ssvid.app/api/ajax/search"
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://ssvid.app/twitter-video-downloader"
    }
    data = {
        "query": twitter_url,
        "cf_token": "",
        "vt": "twitter"
    }
    response = requests.post(api_url, headers=headers, data=data)
    if not response.ok:
        raise Exception("Failed to fetch from ssvid.app")
    result = response.json()
    
    try:
        # Extract video links with multiple resolutions
        video_links = result['data']['links']['video']
        video_formats = []
        
        # Sort by resolution (highest first)
        resolution_order = ['1920x1080', '1280x720', '640x360', '480x270']
        for resolution in resolution_order:
            if resolution in video_links:
                video_formats.append({
                    'resolution': resolution,
                    'q_text': video_links[resolution]['q_text'],
                    'url': video_links[resolution]['url'],
                    'size': video_links[resolution].get('size', 'MB'),
                    'ext': video_links[resolution].get('ext', 'mp4')
                })
        
        # If no standard resolutions found, add any available
        if not video_formats:
            for resolution, video_data in video_links.items():
                video_formats.append({
                    'resolution': resolution,
                    'q_text': video_data['q_text'],
                    'url': video_data['url'],
                    'size': video_data.get('size', 'MB'),
                    'ext': video_data.get('ext', 'mp4')
                })
        
    except Exception:
        video_formats = []
    
    try:
        thumbnail_url = result['data']['thumbnail']
    except Exception:
        thumbnail_url = None
    
    try:
        title = result['data']['title']
    except Exception:
        title = None
    
    flag = bool(video_formats and thumbnail_url)
    return video_formats, thumbnail_url, title, result, flag
