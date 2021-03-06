import json
import os
import sys
from multiprocessing import Pool

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv(override=True)


def strip_list_page(url):
    """Given the url to a page in a Goodreads list, will return a list of urls to books on that page

    Args:
        url (str): The url to a Goodreads page

    Returns:
        List[str]: A list of urls to the books listed on the page
    """
    # Read in the page HTML
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")

    bookFind = soup.find_all("a", class_="bookTitle")
    books_on_page = [f"https://www.goodreads.com{book['href']}" for book in bookFind]
    return books_on_page


def strip_book(url):
    """Given the url to a Goodreads book, will return a dictionary of that books key information
    Args:
        url (str): The url to the Goodreads book
    Returns:
        dict: dictionary of key book information including title, authors, description,
         genres, isbn, language, average rating, and number of reviews
    """

    # Read in the book page HTML
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")

    book = {}

    # Get the title of the book
    book["title"] = soup.find(id="bookTitle").text.strip()

    # Clean and add the list of authors to the dictionary
    author_list = (
        soup.find(id="bookAuthors")
        .text.split("by")[1]
        .replace("(Goodreads Author)", "")
        .split(",")
    )
    book["authors"] = [author.strip() for author in author_list]

    # For the following, check if the element exists, and if so add it to the dictionary
    if (isbn_element := soup.find(itemprop="isbn")) :
        book["isbn"] = isbn_element.text.strip()
    else:
        book["isbn"] = None

    if (genres := soup.find_all(class_="actionLinkLite bookPageGenreLink")) :
        book["genres"] = [genre.text.strip() for genre in genres]
    else:
        book["genres"] = []

    if (language_element := soup.find(itemprop="inLanguage")) :
        book["language"] = language_element.text.strip()
    else:
        book["language"] = None

    if (rating_element := soup.find(itemprop="ratingValue")) :
        book["rating"] = float(rating_element.text.strip())
    else:
        book[""] = None

    if (reviews_element := soup.find(itemprop="reviewCount")) :
        n_review_string = (
            reviews_element.text.split("reviews")[0].strip().replace(",", "")
        )
        if n_review_string.isdigit():
            book["n_reviews"] = int(n_review_string)
    else:
        book["n_reviews"] = None

    if (image_element := soup.find(id="coverImage")) :
        book["image_url"] = image_element["src"]
    else:
        book["image_url"] = None

    book_details = soup.find(id="details").text
    if "first published" in book_details:
        date_string = (
            book_details.split("first published ")[1]
            .split(")")[0]
            .strip()
            .split(" ")[-1]
        )
        if date_string.isdigit():
            book["publication_year"] = date_string
    elif "Published" in book_details:
        date_string = (
            book_details.split("Published")[1].split("by")[0].strip().split(" ")[-1]
        )
        if date_string.isdigit():
            book["publication_year"] = date_string
        else:
            date_string = (
                book_details.split("Published")[1]
                .strip()
                .split("\n")[0]
                .strip()
                .split(" ")[-1]
            )
            if date_string.isdigit():
                book["publication_year"] = date_string
    else:
        book["publication_year"] = None

    try:
        if (publisher_string := book_details.split("by")[1].split("\n")[0].strip()) :
            book["publisher"] = publisher_string
    except:
        book["publisher"] = None

    # If a book's description is long it will be hidden, otherwise just grab the text
    descrFind = soup.find(id="description")
    if descrFind and descrFind.find(style="display:none"):
        book["description"] = descrFind.find(style="display:none").text.strip()
    elif descrFind:
        book["description"] = descrFind.text.strip()

    return book


if __name__ == "__main__":
    # Configure command line arguments
    n_books = (input("Enter number of books to scrape (1000): ")) or 1000
    n_books = int(n_books)
    n_workers = int(input("Enter number of parrallel workers to utilise (16): ")) or 16
    n_workers = int(n_workers)
    list_url = (
        input(
            "Enter Goodreads list to scrape (https://www.goodreads.com/list/show/1.Best_Books_Ever): "
        )
        or "https://www.goodreads.com/list/show/1.Best_Books_Ever"
    )
    out_file = os.getenv("INITIAL_DATA", "books.json")

    # Start of scraping script
    book_urls = []
    books = []
    n_pages = ((n_books - 1) // 100) + 1

    # Process pool for parallel scraping
    pool = Pool(n_workers)

    # All pages to scrape the books from (100 books per page)
    page_urls = [f"{list_url}?page={page_no}" for page_no in range(1, n_pages + 1)]

    # Setup progress bar for creating book list
    list_pbar = tqdm(
        pool.imap_unordered(strip_list_page, page_urls),
        total=n_pages,
        unit="page",
        ncols=100,
        file=sys.stdout,
    )
    list_pbar.set_description("Collecting list of books to scrape")

    for books_on_page in list_pbar:
        list_pbar.update(1)
        book_urls += books_on_page

    # book_urls will have a multiple of 100 books, slice to get exactlyu n_books
    book_urls = book_urls[:n_books]

    # Create pbar to measure progress scraping books
    pbar = tqdm(
        pool.imap_unordered(strip_book, book_urls),
        total=n_books,
        unit="book",
        ncols=100,
        file=sys.stdout,
    )
    for book in pbar:
        pbar.set_description("Scraping books")
        pbar.update(1)
        books.append(book)

    # Close the process pool
    pool.close()
    pool.join()

    with open(out_file, "w") as f:
        json.dump(books, f, indent=2)
