from gutenberg.acquire import load_etext
from gutenberg.cleanup import strip_headers


books_meta = [{
	"title": "Pride and Prejudice",
	"author": "Jane Austen",
	"id": 1342
},
{
	"title": "Anna Karenina",
	"author": "Leo Tolstoy",
	"id": 1399
},
{
	"title": "Frankenstein; Or, The Modern Prometheus",
	"author": "Mary Wollstonecraft Shelley",
	"id": 84
},
{
	"title": "The Scarlet Letter",
	"author": "Nathaniel Hawthorne",
	"id":33
}]

book = load_etext(1342)
book = strip_headers(book)