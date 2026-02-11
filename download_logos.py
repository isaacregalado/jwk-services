import requests
import os

# Ensure directory exists
output_dir = "/Users/Isaac/Desktop/jwk-services/img/clients"
os.makedirs(output_dir, exist_ok=True)

# Dictionary of client names and their best SVG URLs
logos = {
    "disney.svg": "https://cdn.worldvectorlogo.com/logos/the-walt-disney-company.svg",
    "nba.svg": "https://cdn.worldvectorlogo.com/logos/nba-6.svg",
    "nyu.svg": "https://cdn.worldvectorlogo.com/logos/new-york-university-1.svg",
    "conde-nast.svg": "https://upload.wikimedia.org/wikipedia/commons/9/96/Conde_Nast_logo.svg",
    "jane-street.svg": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Jane_Street_Capital_Logo.svg",
    "pfizer.svg": "https://cdn.worldvectorlogo.com/logos/pfizer-2.svg",
    "alexandria.svg": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Alexandria_Real_Estate_Equities_Logo.svg",
    "blackstone.svg": "https://cdn.worldvectorlogo.com/logos/the-blackstone-group.svg",
    "skadden.svg": "https://upload.wikimedia.org/wikipedia/commons/9/98/Skadden.svg",
    "emcor.svg": "https://cdn.worldvectorlogo.com/logos/emcor.svg"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for filename, url in logos.items():
    try:
        print(f"Downloading {filename}...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Check if content is actually an image (not an HTML error page)
        if "image/svg+xml" in response.headers.get("Content-Type", "") or "<svg" in response.text[:1000]:
            file_path = os.path.join(output_dir, filename)
            with open(file_path, "wb") as f:
                f.write(response.content)
            print(f"✅ Saved {filename}")
        else:
            print(f"❌ Failed {filename}: Content doesn't look like SVG")
            
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")

print("Download process complete.")