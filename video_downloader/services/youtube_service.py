import requests

def download_youtube_video(youtube_url):
    api_url = "https://ssvid.app/api/ajax/search?hl=en"
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://ssvid.app/en/youtube-to-mp4"
    }
    data = {
        "query": youtube_url,
        "cf_token": "",
        "vt": "youtube"
    }
    response = requests.post(api_url, headers=headers, data=data)
    if not response.ok:
        raise Exception("Failed to fetch from ssvid.app")
    result = response.json()
    
    try:
        # Extract video links with multiple formats and qualities
        links = result['links']
        video_formats = []
        
        # Process MP4 video formats
        if 'mp4' in links:
            mp4_formats = links['mp4']
            # Sort by quality (highest first)
            quality_order = ['137', '136', '135', '18', '160', 'auto']
            for quality in quality_order:
                if quality in mp4_formats:
                    video_formats.append({
                        'format': 'MP4',
                        'quality': mp4_formats[quality]['q'],
                        'q_text': mp4_formats[quality]['q_text'],
                        'size': mp4_formats[quality]['size'],
                        'ext': mp4_formats[quality]['f'],
                        'key': mp4_formats[quality]['k']
                    })
        
        # Process M4A audio formats
        if 'm4a' in links:
            m4a_formats = links['m4a']
            for quality, audio_data in m4a_formats.items():
                video_formats.append({
                    'format': 'M4A',
                    'quality': audio_data['q'],
                    'q_text': audio_data['q_text'],
                    'size': audio_data['size'],
                    'ext': audio_data['f'],
                    'key': audio_data['k']
                })
        
        # Process MP3 audio formats
        if 'mp3' in links:
            mp3_formats = links['mp3']
            for quality, audio_data in mp3_formats.items():
                video_formats.append({
                    'format': 'MP3',
                    'quality': audio_data['q'],
                    'q_text': audio_data['q_text'],
                    'size': audio_data['size'],
                    'ext': audio_data['f'],
                    'key': audio_data['k']
                })
        
        # Process 3GP formats
        if '3gp' in links:
            gp3_formats = links['3gp']
            for quality, gp3_data in gp3_formats.items():
                video_formats.append({
                    'format': '3GP',
                    'quality': gp3_data['q'],
                    'q_text': gp3_data['q_text'],
                    'size': gp3_data['size'],
                    'ext': gp3_data['f'],
                    'key': gp3_data['k']
                })
        
    except Exception:
        video_formats = []
    
    try:
        title = result['title']
    except Exception:
        title = None
    
    try:
        duration = result.get('t', 0)  # Duration in seconds
        duration_formatted = f"{duration // 60}:{duration % 60:02d}" if duration > 0 else None
    except Exception:
        duration_formatted = None
    
    try:
        video_id = result.get('vid', '')
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/0.jpg" if video_id else None
    except Exception:
        thumbnail_url = None
    
    flag = bool(video_formats)
    return video_formats, thumbnail_url, title, duration_formatted, result, flag

def convert_youtube_video(video_id, key):
    api_url = "https://ssvid.app/api/ajax/convert?hl=en"
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://ssvid.app/en/youtube-to-mp4"
    }
    data = {
        "vid": video_id,
        "k": key
    }
    response = requests.post(api_url, headers=headers, data=data)
    if not response.ok:
        raise Exception("Failed to convert video")
    result = response.json()
    
    try:
        download_url = result['dlink']
    except Exception:
        download_url = None
    
    try:
        status = result['c_status']
    except Exception:
        status = None
    
    try:
        title = result['title']
    except Exception:
        title = None
    
    flag = bool(download_url and status == "CONVERTED")
    return download_url, status, title, result, flag
