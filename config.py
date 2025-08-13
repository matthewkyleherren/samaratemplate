# Pro100Stock Downloader Configuration
# Update these values with your actual credentials and preferences

# Login credentials
EMAIL = "your_email@example.com"  # Replace with your Pro100Stock email
PASSWORD = "your_password"        # Replace with your Pro100Stock password

# Download settings
URL_FILE = "acquireLicensePage_only.html"  # File containing your URLs
BATCH_SIZE = 3                    # Number of URLs to submit at once (max 5)
DELAY_MINUTES = 15                # Minutes to wait between batches
DOWNLOAD_PATH = "downloads"       # Folder to save downloaded files

# Monitoring settings
CHECK_INTERVAL = 30               # Seconds between status checks
MAX_WAIT_TIME = 3600              # Maximum time to wait for downloads (seconds)

# Quality setting for video downloads (if applicable)
QUALITY = "4K"                 # Options: "4K", "1080p", "720p", or empty string

# Base URL (usually doesn't need to change)
BASE_URL = "https://pro100stock.com"

