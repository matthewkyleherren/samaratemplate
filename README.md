# Pro100Stock Downloader Automation

This script automates the download process for Adobe Stock URLs using the Pro100Stock service. It handles login, batch processing, and automatic file downloads with configurable delays.

## Features

- **Automated Login**: Handles authentication to Pro100Stock
- **Batch Processing**: Submits URLs in configurable batches (default: 3 URLs per batch)
- **Rate Limiting**: Waits between batches to respect service limits (default: 15 minutes)
- **Automatic Downloads**: Monitors download progress and automatically downloads completed files
- **Logging**: Comprehensive logging to both console and file
- **Error Handling**: Robust error handling and retry logic

## Prerequisites

- Python 3.7 or higher
- Pro100Stock account with active subscription
- List of Adobe Stock URLs to download

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure the script:**
   - Edit `config.py` and update the following:
     - `EMAIL`: Your Pro100Stock email address
     - `PASSWORD`: Your Pro100Stock password
     - `URL_FILE`: Path to your file containing URLs (default: `acquireLicensePage_only.html`)
     - `BATCH_SIZE`: Number of URLs to submit at once (max 5, default: 3)
     - `DELAY_MINUTES`: Minutes to wait between batches (default: 15)

## Usage

1. **Prepare your URL file:**
   - Create a text file with one Adobe Stock URL per line
   - The script will automatically read URLs from the file specified in `config.py`

2. **Run the script:**
   ```bash
   python pro100stock_downloader.py
   ```

3. **Monitor progress:**
   - The script will log progress to both console and `downloader.log`
   - Downloaded files will be saved to the `downloads/` folder (configurable)

## Configuration Options

### `config.py` Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `EMAIL` | Your Pro100Stock email | `your_email@example.com` |
| `PASSWORD` | Your Pro100Stock password | `your_password` |
| `URL_FILE` | File containing URLs | `acquireLicensePage_only.html` |
| `BATCH_SIZE` | URLs per batch (max 5) | `3` |
| `DELAY_MINUTES` | Minutes between batches | `15` |
| `DOWNLOAD_PATH` | Folder for downloads | `downloads` |
| `CHECK_INTERVAL` | Status check interval (seconds) | `30` |
| `MAX_WAIT_TIME` | Max wait time for downloads (seconds) | `3600` |
| `QUALITY` | Video quality (4K, 1080p, 720p) | `1080p` |

## How It Works

1. **Login**: Authenticates with Pro100Stock using your credentials
2. **URL Processing**: Reads URLs from your file and processes them in batches
3. **Batch Submission**: Submits each batch of URLs to the download service
4. **Waiting**: Waits the specified delay between batches
5. **Monitoring**: Continuously checks download status
6. **Downloading**: Automatically downloads completed files

## File Structure

```
├── pro100stock_downloader.py  # Main script
├── config.py                  # Configuration file
├── requirements.txt           # Python dependencies
├── README.md                  # This file
├── acquireLicensePage_only.html  # Your URL file
├── downloads/                 # Downloaded files (created automatically)
└── downloader.log            # Log file (created automatically)
```

## Troubleshooting

### Common Issues

1. **Login Failed**
   - Verify your email and password in `config.py`
   - Check if your Pro100Stock subscription is active
   - Ensure you're not being blocked by rate limiting

2. **No URLs Found**
   - Check that your URL file exists and contains valid URLs
   - Ensure URLs are one per line
   - Verify the file path in `config.py`

3. **Downloads Not Starting**
   - Check your Pro100Stock credits/limits
   - Verify the URLs are valid Adobe Stock links
   - Check the log file for specific error messages

4. **Script Stops Unexpectedly**
   - Check `downloader.log` for error details
   - Verify network connectivity
   - Ensure Pro100Stock service is available

### Log Files

The script creates detailed logs in `downloader.log` including:
- Login attempts and results
- URL submission status
- Download progress
- Error messages and stack traces

## Security Notes

- Never commit your `config.py` file with real credentials
- Consider using environment variables for sensitive data
- The script stores your session cookies temporarily

## Limitations

- Maximum 5 concurrent downloads (Pro100Stock limit)
- Downloads are stored for 3 hours on Pro100Stock servers
- Requires active Pro100Stock subscription
- Adobe Stock URLs only (other services may require different handling)

## Support

If you encounter issues:
1. Check the log file for detailed error messages
2. Verify your Pro100Stock account status
3. Ensure all dependencies are installed correctly
4. Check that your URLs are valid Adobe Stock links

