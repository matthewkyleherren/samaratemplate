#!/usr/bin/env python3
"""
Pro100Stock Downloader Automation Script
Automates the download process for Adobe Stock URLs with batch processing and delays.
"""

import requests
import time
import json
import os
from urllib.parse import urlparse
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('downloader.log'),
        logging.StreamHandler()
    ]
)

class Pro100StockDownloader:
    def __init__(self, base_url: str = "https://pro100stock.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.csrf_token = None
        self.is_logged_in = False
        
    def login(self, email: str, password: str) -> bool:
        """Login to Pro100Stock"""
        try:
            # First, get the login page to extract CSRF token
            login_page = self.session.get(f"{self.base_url}/login")
            if login_page.status_code != 200:
                logging.error(f"Failed to access login page: {login_page.status_code}")
                return False
                
            # Extract CSRF token from the page
            # You might need to adjust this based on the actual login page structure
            if 'csrf-token' in login_page.text:
                # This is a simplified extraction - you may need to adjust
                csrf_start = login_page.text.find('csrf-token" content="') + 20
                csrf_end = login_page.text.find('"', csrf_start)
                self.csrf_token = login_page.text[csrf_start:csrf_end]
            
            # Prepare login data
            login_data = {
                'email': email,
                'password': password,
                '_token': self.csrf_token
            }
            
            # Perform login
            login_response = self.session.post(
                f"{self.base_url}/auth/login",
                data=login_data,
                headers={'X-CSRF-TOKEN': self.csrf_token} if self.csrf_token else {}
            )
            
            if login_response.status_code == 200:
                # Check if login was successful by trying to access a protected page
                dashboard = self.session.get(f"{self.base_url}/")
                if dashboard.status_code == 200 and 'm@fck.inc' in dashboard.text:
                    self.is_logged_in = True
                    logging.info("Successfully logged in to Pro100Stock")
                    return True
                else:
                    logging.error("Login failed - could not access dashboard")
                    return False
            else:
                logging.error(f"Login request failed: {login_response.status_code}")
                return False
                
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            return False
    
    def submit_download_request(self, url: str, quality: str = "1080p") -> Dict:
        """Submit a single download request"""
        try:
            download_data = {
                'question': url,
                'quality': quality
            }
            
            headers = {}
            if self.csrf_token:
                headers['X-CSRF-TOKEN'] = self.csrf_token
            
            response = self.session.post(
                f"{self.base_url}/api/downloads",
                json=download_data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                logging.info(f"Successfully submitted download request for: {url}")
                return result
            else:
                logging.error(f"Failed to submit download request: {response.status_code}")
                return {'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            logging.error(f"Error submitting download request: {str(e)}")
            return {'error': str(e)}
    
    def get_download_status(self) -> List[Dict]:
        """Get current download status"""
        try:
            response = self.session.get(f"{self.base_url}/api/downloads")
            if response.status_code == 200:
                result = response.json()
                return result.get('items', [])
            else:
                logging.error(f"Failed to get download status: {response.status_code}")
                return []
        except Exception as e:
            logging.error(f"Error getting download status: {str(e)}")
            return []
    
    def download_file(self, file_id: str, download_path: str = "downloads") -> bool:
        """Download a completed file"""
        try:
            if not os.path.exists(download_path):
                os.makedirs(download_path)
                
            download_url = f"{self.base_url}/download/{file_id}"
            response = self.session.get(download_url, stream=True)
            
            if response.status_code == 200:
                # Try to get filename from headers or use file_id
                filename = response.headers.get('content-disposition', '')
                if 'filename=' in filename:
                    filename = filename.split('filename=')[1].strip('"')
                else:
                    filename = f"file_{file_id}.zip"
                
                filepath = os.path.join(download_path, filename)
                
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                logging.info(f"Successfully downloaded: {filepath}")
                return True
            else:
                logging.error(f"Failed to download file {file_id}: {response.status_code}")
                return False
                
        except Exception as e:
            logging.error(f"Error downloading file {file_id}: {str(e)}")
            return False
    
    def process_urls_in_batches(self, urls: List[str], batch_size: int = 3, 
                               delay_minutes: int = 15, quality: str = "1080p") -> None:
        """Process URLs in batches with delays"""
        if not self.is_logged_in:
            logging.error("Not logged in. Please login first.")
            return
        
        total_urls = len(urls)
        processed = 0
        
        logging.info(f"Starting batch processing of {total_urls} URLs")
        logging.info(f"Batch size: {batch_size}, Delay between batches: {delay_minutes} minutes")
        
        for i in range(0, total_urls, batch_size):
            batch = urls[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total_urls + batch_size - 1) // batch_size
            
            logging.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} URLs)")
            
            # Submit all URLs in current batch
            for url in batch:
                result = self.submit_download_request(url, quality)
                if 'error' not in result:
                    processed += 1
                time.sleep(2)  # Small delay between submissions
            
            # Wait before next batch (except for the last batch)
            if i + batch_size < total_urls:
                logging.info(f"Waiting {delay_minutes} minutes before next batch...")
                time.sleep(delay_minutes * 60)
        
        logging.info(f"Batch submission complete. {processed}/{total_urls} URLs submitted.")
    
    def monitor_and_download(self, download_path: str = "downloads", 
                           check_interval: int = 30, max_wait_time: int = 3600) -> None:
        """Monitor download progress and download completed files"""
        logging.info("Starting download monitoring...")
        
        start_time = time.time()
        downloaded_files = set()
        
        while time.time() - start_time < max_wait_time:
            try:
                items = self.get_download_status()
                
                for item in items:
                    item_id = str(item.get('id'))
                    
                    # Skip if already downloaded
                    if item_id in downloaded_files:
                        continue
                    
                    # Check if download is ready
                    if item.get('answer') and not item.get('downloaded'):
                        logging.info(f"Download ready for item {item_id}")
                        if self.download_file(item_id, download_path):
                            downloaded_files.add(item_id)
                
                # Check if all downloads are complete
                pending_items = [item for item in items if not item.get('answer')]
                if not pending_items:
                    logging.info("All downloads completed!")
                    break
                
                logging.info(f"Waiting {check_interval} seconds... ({len(pending_items)} items pending)")
                time.sleep(check_interval)
                
            except Exception as e:
                logging.error(f"Error during monitoring: {str(e)}")
                time.sleep(check_interval)
        
        logging.info("Download monitoring completed.")

def load_urls_from_file(filename: str) -> List[str]:
    """Load URLs from a text file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
        return urls
    except Exception as e:
        logging.error(f"Error loading URLs from file: {str(e)}")
        return []

def main():
    # Import configuration
    try:
        import config
    except ImportError:
        logging.error("config.py file not found. Please create it with your settings.")
        return
    
    # Initialize downloader
    downloader = Pro100StockDownloader(config.BASE_URL)
    
    # Load URLs
    urls = load_urls_from_file(config.URL_FILE)
    if not urls:
        logging.error("No URLs found in file")
        return
    
    logging.info(f"Loaded {len(urls)} URLs from {config.URL_FILE}")
    
    # Login
    if not downloader.login(config.EMAIL, config.PASSWORD):
        logging.error("Failed to login. Please check your credentials.")
        return
    
    # Process URLs in batches
    downloader.process_urls_in_batches(urls, config.BATCH_SIZE, config.DELAY_MINUTES, config.QUALITY)
    
    # Monitor and download completed files
    downloader.monitor_and_download(config.DOWNLOAD_PATH, config.CHECK_INTERVAL, config.MAX_WAIT_TIME)

if __name__ == "__main__":
    main()
