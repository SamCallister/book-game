"""Generates book trivia game questions"""
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from collections import Counter
import numpy as np
from sklearn.neighbors import KernelDensity
from pathlib import Path
from gutenberg.acquire import load_etext
from gutenberg.cleanup import strip_headers
from nltk.corpus import stopwords
import string
import json
from functools import lru_cache

kernel_bandwidth = 1.5
outlier_quantile = 0.98

basic_stopwords_set = set(stopwords.words("english"))
punctuation_set = set(string.punctuation).union(
    {"”", "’", "``", "“", "''", "n't", "--", "'ll", "'s", "'re", "'em", "'d", "'m"}
)
custom_stop_words = {
    "mr.",
    "miss",
    "mrs.",
    "said",
    "mr",
    "mrs",
    "th",
    "chapter",
    "l.",
    "well.",
    "—the",
    "—",
    "....",
    "de",
    "niggers",
}

custom_non_adj = {
    "alarmed",
    "guildenstern",
    "grimpen",
    "jurgis",
    "ii",
    "e",
    "osric",
    "iii",
    "iv",
    "polonius",
    "unto",
    "hath",
    "doth",
    "forc",
    "rous",
    "stay",
    "ahab",
    "starbuck",
    "moby",
    "stubb",
    "queequeg",
    "mortimer",
    "sherlock",
    "ye",
    "nigh",
    "fast-fish",
    "whale",
    "sperm",
    "loose-fish",
    "astern",
    "not.",
    "northumberland",
    "ona",
    "packingtown",
    "twenty-five",
    "teta",
    "marija",
    "saturday",
    "mast-head",
    "baskerville",
    "hundred-dollar",
    "tree",
    "marlow",
    "kurtz",
    "six-inch",
    "diary",
    "to-night",
    "to-day",
    "dr.",
    "madam",
    "quincey",
    "to-morrow",
    "van",
    "dublin",
    "kathleen",
    "next-door",
    "frank",
    "lenehan",
    "ivy",
    "admiral",
    "dr.",
    "bible",
    "chest",
    "flint",
    "ben",
    "israel",
    "yo-ho-ho",
    "livesey",
    "n",
    "captain",
    "_jonathan",
    "lucy",
    "london",
    "baggot",
    "freddy",
    "gabriel",
    "constable",
    "grafton",
    "dooty",
    "tavern",
    "thimble",
    "forecastle",
    "ship",
    "cap",
    "agonised",
    "_hail",
    "music-hall",
    "e.",
    "spy-glass",
    "sparred",
    "grown",
    "attendants._",
    "hamlet._",
    "soldier",
    "good-bye",
    "oxford",
    "_times_",
    "absent-minded",
    "selden",
    "tommy",
    "antanas",
    "unfold",
    "hid",
    "right.",
    "curly-haired",
    "aniele",
    "polish",
    "lucy's",
    "whilst",
    "working-man",
    "cheese",
    "round-shot",
    "madness",
    "lean-jawed",
    "supra-orbital",
    "arrive",
    "black-bearded",
    "gatsby",
    "daisy",
    "jordan",
    "myrtle",
    "nick",
    "...",
    "ga-od",
    "neighbour",
    "prep",
    "wilson",
    "jay",
    "insisted",
    "return",
    "finger-tips",
    "…",
    "hampstead",
    "aunt",
    "enter",
    "underwear",
    "fitzpatrick",
}
custom_non_verb = {
    "sir",
    "jurgis",
    "ahab",
    "queequeg",
    "leeward",
    "stubb",
    "play._",
    "polonius",
    "en",
    "doth",
    "laertes",
    "hamlet",
    "starbuck",
    "pearl",
    "hester",
    "baskerville",
    "dr",
    "holmes",
    "stapleton",
    "coombe",
    "devonshire",
    "did.",
    "think.",
    "watson",
    "dr.",
    "baker",
    "helsing",
    "ca",
    "godalming",
    "lucy",
    "huts",
    "van",
    "jonathan",
    "arthur",
    "'ve",
    "mina",
    "wo",
    "m.",
    "dantès",
    "albert",
    "franz",
    "danglars",
    "morrel",
    "heaven",
    "valentine",
    "leatherhead",
    "castruccio",
    "rome",
    "ai",
    "quincey",
    "renfield",
    "whitby",
    "fernand",
    "hawkins",
    "madam",
    "mademoiselle",
    "alexander",
    "fortune",
    "perkins",
    "curved",
    "outlying",
    "merripit",
    "barrymore",
    "sake",
    "selden",
    "_is_",
    "woking",
}
custom_non_noun = {
    "ye",
    "nigh",
    "thou",
    "gatsby",
    "daisy",
    "tom",
    "jordan",
    "wilson",
    "hester",
    "prynne",
    "pearl",
    "dimmesdale",
    "scarlet",
}
all_stop_words = basic_stopwords_set.union(punctuation_set).union(custom_stop_words)


def unique_and_score_kde(kde, X):
    X_unique = np.unique(X)
    Y = np.exp(kde.score_samples(X_unique.reshape(len(X_unique), 1)))
    result = np.concatenate(
        (np.array([0, 0]).reshape(2, 1), np.unique(np.array((X_unique, Y)), axis=1)),
        axis=1,
    )

    return [tuple(r) for r in result.T]


def trim_sent_len_outliers(arr):
    return arr[arr < np.quantile(arr, outlier_quantile)]


@lru_cache
def load_and_strip(book_id):
    return strip_headers(load_etext(book_id))


def get_probability_vec(lengths, max_sent_length):
    result = np.zeros(max_sent_length + 1)
    word_lengths, counts = np.unique(lengths, return_counts=True)
    for i, word_length in enumerate(word_lengths):
        result[word_length] = counts[i]

    return result / result.sum()


def get_sentence_lengths_num_words(text):
    return [len(nltk.word_tokenize(s)) for s in nltk.sent_tokenize(text)]


def get_word_lengths(text):
    return [len(s) for s in nltk.word_tokenize(text)]


def word_length_question(q):
    books = [load_and_strip(id) for id in q["answers"]]

    # each book is its own row (along axis 0)
    book_word_lengths = [np.array(get_word_lengths(text)) for text in books]

    max_avg_index = np.argmax([b.mean() for b in book_word_lengths])

    all_book_length = np.concatenate(book_word_lengths, axis=0)
    all_book_length.sort()

    kde_all = KernelDensity(bandwidth=kernel_bandwidth, kernel="gaussian")
    kde_all.fit(all_book_length.reshape(len(all_book_length), 1))

    answer_word_lengh = book_word_lengths[max_avg_index]
    answer_word_lengh.sort()

    kde_answer = KernelDensity(bandwidth=kernel_bandwidth, kernel="gaussian")
    kde_answer.fit(answer_word_lengh.reshape(len(answer_word_lengh), 1))

    return dict(
        correct_answer=q["answers"][max_avg_index],
        data=dict(
            all_points=unique_and_score_kde(kde_all, all_book_length),
            answer_points=unique_and_score_kde(kde_answer, answer_word_lengh),
        ),
    )


def sentence_length_question(q, min_or_max):
    books = [load_and_strip(id) for id in q["answers"]]
    book_sent_lengths = [get_sentence_lengths_num_words(text) for text in books]

    book_median_sent_lengths = [np.median(lengths) for lengths in book_sent_lengths]

    answer_choosing_function = np.argmin if min_or_max == "min" else np.argmax
    answer_index = answer_choosing_function(book_median_sent_lengths)

    # get kde estimates
    other_sent_length = trim_sent_len_outliers(
        np.array(
            sorted(
                [
                    s
                    for i, sents in enumerate(book_sent_lengths)
                    if i != answer_index
                    for s in sents
                ]
            )
        )
    )
    answer_sent_length = trim_sent_len_outliers(
        np.array(sorted(book_sent_lengths[answer_index]))
    )

    kde_others = KernelDensity(bandwidth=kernel_bandwidth, kernel="gaussian")
    kde_others.fit(other_sent_length.reshape(len(other_sent_length), 1))

    kde_answer = KernelDensity(bandwidth=kernel_bandwidth, kernel="gaussian")
    kde_answer.fit(answer_sent_length.reshape(len(answer_sent_length), 1))

    return dict(
        correct_answer=q["answers"][answer_index],
        data=dict(
            other_points=unique_and_score_kde(kde_others, other_sent_length),
            answer_points=unique_and_score_kde(kde_answer, answer_sent_length),
        ),
    )


def get_adj_from_book(book_id):
    return [
        word
        for word, tag in get_tagged_words_for_book(book_id)
        if tag == "ADJ" and word not in custom_non_adj
    ]


def get_verb_from_book(book_id):
    return [
        word
        for word, tag in get_tagged_words_for_book(book_id)
        if tag == "VERB" and word not in custom_non_verb
    ]


def words_best_associated_with_book_question(words_per_book, q):
    string_book_words = [" ".join(words) for words in words_per_book]
    chosen_words = [x[0] for x in get_tf_idf_question(q, books=string_book_words)]

    index_of_correct_answer = get_correct_answer_index(q)
    freq_dist = nltk.FreqDist(words_per_book[index_of_correct_answer])

    return dict(data=[(w, freq_dist.get(w)) for w in chosen_words])


def pos_quesiton(q):
    if q["meta"]["sub_type"] == "adj":
        book_adjectives = [get_adj_from_book(book_id) for book_id in q["answers"]]
        return words_best_associated_with_book_question(book_adjectives, q)

    elif q["meta"]["sub_type"] == "verb":
        book_verbs = [get_verb_from_book(book_id) for book_id in q["answers"]]
        return words_best_associated_with_book_question(book_verbs, q)

    elif q["meta"]["sub_type"] == "noun":
        nouns = [
            word
            for word, tag in get_tagged_words_for_book(q["correct_answer"])
            if tag == "NOUN" and word not in custom_non_noun
        ]
        return dict(data=nltk.FreqDist(nouns).most_common(q["meta"]["num_words"]))

    raise Exception(
        f"Question subtype {q['meta']['sub_type']} for meta {q['meta']} not supported"
    )


def get_tf_idf_question(q, books=None):
    books = books or [load_and_strip(book_id) for book_id in q["answers"]]
    vectorizer = TfidfVectorizer(stop_words=all_stop_words)
    X = vectorizer.fit_transform(books)
    df = pd.DataFrame(
        data=X.toarray(),
        index=range(len(books)),
        columns=vectorizer.get_feature_names_out(X),
    )
    index_of_correct_answer = get_correct_answer_index(q)

    return [
        (i, v)
        for i, v in df.T.iloc[:, index_of_correct_answer]
        .sort_values(ascending=False)[: q["meta"]["num_words"]]
        .iteritems()
    ]


def filter_words(words):
    return [w for w in words if w not in all_stop_words]


def get_words_per_book(book_ids):
    return [
        filter_words(nltk.word_tokenize(str.lower(load_and_strip(book_id))))
        for book_id in book_ids
    ]


def get_unique_words(words_per_book, correct_answer_index):
    correct_words = words_per_book[correct_answer_index]

    other_sets = set(
        [
            word
            for i, words in enumerate(words_per_book)
            for word in words
            if i != correct_answer_index
        ]
    )

    return set(correct_words) - other_sets


def get_unique_verbs(q):
    verbs_per_book = [get_verb_from_book(book_id) for book_id in q["answers"]]
    return get_unique_most_common(q, passed_words_per_book=verbs_per_book)


def get_unique_adj(q):
    adj_per_book = [get_adj_from_book(book_id) for book_id in q["answers"]]
    return get_unique_most_common(q, passed_words_per_book=adj_per_book)


def get_correct_answer_index(q):
    return q["answers"].index(q["correct_answer"])


def get_unique_most_common(q, passed_words_per_book=None):
    words_per_book = passed_words_per_book or get_words_per_book(q["answers"])
    index_of_correct_answer = get_correct_answer_index(q)

    unique_words = get_unique_words(words_per_book, index_of_correct_answer)
    correct_words = words_per_book[index_of_correct_answer]

    return Counter([w for w in correct_words if w in unique_words]).most_common(
        q["meta"]["num_words"]
    )


def get_unique_longest(q):
    words_per_book = get_words_per_book(q["answers"])
    index_of_correct_answer = get_correct_answer_index(q)

    unique_words = get_unique_words(words_per_book, index_of_correct_answer)

    words_sorted_by_length = sorted([(len(w), w) for w in unique_words], reverse=True)
    # filter out words with hypens or punctuation
    punc_set = set(string.punctuation).union("—")

    return [
        w for _, w in words_sorted_by_length if not set(punc_set).intersection(set(w))
    ][: q["meta"]["num_words"]]


@lru_cache
def get_tagged_words_for_book(book_id):
    book = load_and_strip(book_id)

    sents = [nltk.word_tokenize(str.lower(s)) for s in nltk.sent_tokenize(book)]
    tagged_sents = nltk.pos_tag_sents(sents)
    tagged_words = [
        (word, nltk.tag.map_tag("en-ptb", "universal", tag))
        for s in tagged_sents
        for word, tag in s
    ]

    return [x for x in tagged_words if x[0] not in all_stop_words]


def process_question(q):
    if q["meta"]["type"] == "pos-question":
        question_res = pos_quesiton(q)
        return {
            **q,
            **dict(data=question_res["data"]),
            **dict(
                correct_answer=q.get(
                    "correct_answer", question_res.get("correct_answer")
                )
            ),
        }
    elif q["meta"]["type"] == "tf-idf":
        return {**q, **dict(data=get_tf_idf_question(q))}
    elif q["meta"]["type"] == "longest-median-sent-length":
        return {**q, **sentence_length_question(q, "max")}
    elif q["meta"]["type"] == "shortest-median-sent-length":
        return {**q, **sentence_length_question(q, "min")}
    elif q["meta"]["type"] == "word-length":
        return {**q, **word_length_question(q)}
    elif q["meta"]["type"] == "unique-most-common":
        return {**q, **dict(data=get_unique_most_common(q))}
    elif q["meta"]["type"] == "unique-verb":
        return {**q, **dict(data=get_unique_verbs(q))}
    elif q["meta"]["type"] == "unique-adj":
        return {**q, **dict(data=get_unique_adj(q))}
    elif q["meta"]["type"] == "unique-longest":
        return {**q, **dict(data=get_unique_longest(q))}

    raise Exception(
        f"Question type {q['meta']['type']} for meta {q['meta']} not supported"
    )


def id_to_info(books_map, i):
    entry = books_map[i]
    return dict(id=i, title=entry["title"], author=entry["author"])


def build_game(path_to_game_json):
    game_data = json.loads(Path(path_to_game_json).read_text())
    books = game_data["books"]
    book_map = {b["id"]: b for b in books}
    answer_ids = [b["id"] for b in books]
    questions = [{**q, **dict(answers=answer_ids)} for q in game_data["questions"]]

    finished_questions = [process_question(q) for q in questions]

    final_questions = [
        {
            **q,
            **{"correct_answer": id_to_info(book_map, q["correct_answer"])},
            **{"answers": [id_to_info(book_map, a_id) for a_id in q["answers"]]},
        }
        for q in finished_questions
    ]

    return dict(questions=final_questions, books=books)


def main():
    games = [
        build_game("book_data/game_1.json"),
        build_game("book_data/game_2.json"),
        build_game("book_data/game_3.json"),
        build_game("book_data/game_4.json"),
    ]

    output_path = Path.cwd().parent.parent / "public" / "data"
    output_path.mkdir(parents=True, exist_ok=True)
    (output_path / "games.json").write_text(json.dumps(games))


if __name__ == "__main__":
    main()
