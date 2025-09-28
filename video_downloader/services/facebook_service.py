import requests

def download_facebook_video(facebook_url):
    api_url = "https://ssvid.net/api/ajax/search?hl=en"
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://ssvid.net/en19/facebook-video-downloader"
    }
    data = {
        "query": facebook_url,
        "cf_token": "",
        "vt": "facebook"
    }
    response = requests.post(api_url, headers=headers, data=data)
    if not response.ok:
        raise Exception("Failed to fetch from ssvid.net")
    result = response.json()
    try:
        video_url = result['data']['links']['video']['hd']['url']
    except Exception:
        try:
            video_url = result['data']['links']['video']['sd']['url']
        except Exception:
            video_url = None
    try:
        thumbnail_url = result['data']['thumbnail']
    except Exception:
        thumbnail_url = None
    flag = bool(video_url and thumbnail_url)
    return video_url, thumbnail_url, result, flag
