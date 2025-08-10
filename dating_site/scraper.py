import os
import json
from firecrawl import FirecrawlApp
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def scrape_profile_data(url: str):
    """
    Scrapes a website for dating profile information using Firecrawl.

    Args:
        url: The URL of the website to scrape.

    Returns:
        The scraped data as a dictionary, or None if an error occurs.
    """
    # Get the Firecrawl API key from the environment variable
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("Error: FIRECRAWL_API_KEY environment variable not set.")
        print("Please create a .env file in the dating_site directory and add your API key:")
        print("FIRECRAWL_API_KEY='your_api_key_here'")
        return None

    # Initialize the FirecrawlApp
    app = FirecrawlApp(api_key=api_key)

    # Define the schema for the data to be extracted
    # This schema is for a dating profile. You may need to adjust it
    # based on the structure of the target website.
    schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer"},
            "location": {"type": "string"},
            "bio": {"type": "string", "description": "A short biography of the user."},
            "interests": {
                "type": "array",
                "items": {"type": "string"},
                "description": "A list of the user's interests or hobbies.",
            },
            "profile_picture_url": {"type": "string", "format": "uri"},
        },
        "required": ["name", "bio"],
    }

    try:
        # Scrape the website
        scraped_data = app.scrape(
            url=url,
            params={
                "extractorOptions": {
                    "mode": "llm-extraction",
                    "extractionSchema": schema,
                }
            },
        )
        # The data is in a 'data' key and 'llm_extraction' subkey
        return scraped_data['data']['llm_extraction']

    except Exception as e:
        print(f"An error occurred while scraping: {e}")
        return None

if __name__ == "__main__":
    # --- IMPORTANT ---
    # Replace this with the actual URL of the dating profile you want to scrape.
    # I am using a placeholder because I cannot access external websites.
    TARGET_URL = "https://example.com" # A placeholder URL

    # Scrape the data
    profile_data = scrape_profile_data(TARGET_URL)

    if profile_data:
        # Save the data to a JSON file
        output_filename = "dating_site/profiles.json"
        with open(output_filename, "w") as json_file:
            json.dump(profile_data, json_file, indent=4)
        print(f"Scraped data successfully saved to {output_filename}")
    else:
        print("Failed to scrape data.")
