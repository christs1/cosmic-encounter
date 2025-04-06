import urllib.request
import os

# Create textures directory if it doesn't exist
if not os.path.exists('textures'):
    os.makedirs('textures')

# URLs for textures
textures = {
    'earth.jpg': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'clouds.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
}

# Download each texture
for filename, url in textures.items():
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, os.path.join('textures', filename))
    print(f"Downloaded {filename}")

print("All textures downloaded successfully!") 