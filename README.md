# Book Game

This repo contains

1. Python to generate book trivia games from descriptive JSON.
2. React frontend to display generated games.


## Running Question Generation Script


Requires conda. To install dependencies:

```
conda create env -f environment.yml
conda activate book_game
```


gutenberg client [special install instructions](https://github.com/c-w/gutenberg#python-3)

```
brew install berkeley-db4
```

Necessary ntlk data downloads

```
import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')
nltk.download('universal_tagset')
```

Run the script

```
cd src/python
python main.py
```

## Running the client

```
npm install
npm start
```

## Linting/Formatting

```
./scripts/lint_and_format.sh
```

## TODO

- Explore different POS taggers
- Tool to automatically generate possible questions + approve them/reject words
- Not using the metadata indexing feature of gutenberg client. Get a different client that doesn't require external dependencies