import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from collections import Counter
from functools import reduce
from scipy.spatial import distance
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

basic_stopwords_set = set(stopwords.words('english'))
punctuation_set = set(string.punctuation).union({'”', '’', '``','“', "''", "n't", "--", "'ll" })
custom_stop_words = {'mr.', 'miss', 'mrs.', 'said', 'mr', 'mrs', 'th'}
all_stop_words = basic_stopwords_set.union(
    punctuation_set).union(custom_stop_words)


def unique_and_score_kde(kde, X):
    X_unique = np.unique(X)
    Y = np.exp(kde.score_samples(X_unique.reshape(len(X_unique), 1)))
    result = np.concatenate((np.array([0, 0]).reshape(2, 1),
                          np.unique(np.array((X_unique, Y)), axis=1)), axis=1)

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
    # get max word length
    max_word_length = max([b.max() for b in book_word_lengths])

    all_book_length = np.concatenate(book_word_lengths, axis=0)
    all_book_length.sort()

    kde_all = KernelDensity(bandwidth=kernel_bandwidth, kernel='gaussian')
    kde_all.fit(all_book_length.reshape(len(all_book_length), 1))

    answer_word_lengh = book_word_lengths[max_avg_index]
    answer_word_lengh.sort()

    kde_answer = KernelDensity(bandwidth=kernel_bandwidth, kernel='gaussian')
    kde_answer.fit(answer_word_lengh.reshape(len(answer_word_lengh), 1))

    return dict(correct_answer=q["answers"][max_avg_index],
                data=dict(all_points=unique_and_score_kde(kde_all, all_book_length),
                   answer_points=unique_and_score_kde(kde_answer, answer_word_lengh)))


def sentence_length_question(q):
    books = [load_and_strip(id) for id in q["answers"]]

    book_sent_lengths = [
        get_sentence_lengths_num_words(text) for text in books]
    # get max sentence length
    max_sent_length = max([l for sent_lengths in book_sent_lengths
        for l in sent_lengths])

    probability_vecs = np.array([get_probability_vec(lengths, max_sent_length)
     for lengths in book_sent_lengths])

    avg_prob_vec = probability_vecs.mean(axis=0)

    index_of_most_different = np.argmax([
        distance.jensenshannon(v, avg_prob_vec)
        for v in probability_vecs
    ])

    # get kde estimates
    other_sent_length = trim_sent_len_outliers(
        np.array(sorted([s for i, sents in enumerate(book_sent_lengths) if i != index_of_most_different
         for s in sents]))
    )
    answer_sent_length = trim_sent_len_outliers(
        np.array(sorted(book_sent_lengths[index_of_most_different]))
    )

    kde_others = KernelDensity(bandwidth=kernel_bandwidth, kernel='gaussian')
    kde_others.fit(other_sent_length.reshape(len(other_sent_length), 1))

    kde_answer = KernelDensity(bandwidth=kernel_bandwidth, kernel='gaussian')
    kde_answer.fit(answer_sent_length.reshape(len(answer_sent_length), 1))

    return dict(correct_answer=q["answers"][index_of_most_different],
                data=dict(other_points=unique_and_score_kde(kde_others, other_sent_length),
                   answer_points=unique_and_score_kde(kde_answer, answer_sent_length)))


# get data for questions
def pos_quesiton(q):
    if q["meta"]["sub_type"] == "adj":
        adjectives = [x[0] for x in get_tagged_words_for_book(q["correct_answer"])
                      if x[1] in {"JJ", "JJR", "JJS"}]
        return dict(data=nltk.FreqDist(adjectives).most_common(q["meta"]["num_words"]))
    elif q["meta"]["sub_type"] == "verb":
        verbs = [x[0] for x in get_tagged_words_for_book(q["correct_answer"])
                 if x[1] in {"VB", "VBD", "VBP"}]
        return dict(data=nltk.FreqDist(verbs).most_common(q["meta"]["num_words"]))
    elif q["meta"]["sub_type"] == "noun":
        nouns = [x[0] for x in get_tagged_words_for_book(q["correct_answer"])
                 if x[1] in {"NN", "NNS", "NNP", "NNPS"}]
        return dict(data=nltk.FreqDist(nouns).most_common(q["meta"]["num_words"]))
    elif q["meta"]["sub_type"] == "noun-to-verb":
        return noun_to_verb_ratio_question(q)

    raise Exception(
        f"Question subtype {q['meta']['sub_type']} for meta {q['meta']} not supported")


def get_tf_idf_question(q):
    books = [load_and_strip(book_id)
            for book_id in q["answers"]]
    vectorizer = TfidfVectorizer(stop_words=all_stop_words)
    X = vectorizer.fit_transform(books)
    df = pd.DataFrame(
        data=X.toarray(),
        index=range(len(books)),
        columns=vectorizer.get_feature_names_out(X)
    )
    index_of_correct_answer = q["answers"].index(q["correct_answer"])

    return [
        (i, v)
        for i, v in df.T.iloc[:, index_of_correct_answer].sort_values(ascending=False)[:q["meta"]["num_words"]].iteritems()
    ]

def filter_words(words):
    return [
        w for w in words
        if w not in all_stop_words
    ]

def get_words_per_book(book_ids):
    return [
        filter_words(nltk.word_tokenize(str.lower(load_and_strip(book_id))))
            for book_id in book_ids
    ]


def get_unique_words(words_per_book, correct_answer_index):
    correct_words = words_per_book[correct_answer_index]

    other_sets = set([word for i, words in enumerate(words_per_book)
                 for word in words if i != correct_answer_index])

    return set(correct_words) - other_sets


def get_unique_most_common(q):
    words_per_book = get_words_per_book(q["answers"])
    index_of_correct_answer = q["answers"].index(q["correct_answer"])

    unique_words = get_unique_words(words_per_book, index_of_correct_answer)
    correct_words = words_per_book[index_of_correct_answer]

    return Counter([w for w in correct_words if w in unique_words]).most_common(q["meta"]["num_words"])


def get_unique_longest(q):
    words_per_book = get_words_per_book(q["answers"])
    index_of_correct_answer = q["answers"].index(q["correct_answer"])

    unique_words = get_unique_words(words_per_book, index_of_correct_answer)

    words_sorted_by_length = sorted(
        [(len(w), w) for w in unique_words], reverse=True)
    # filter out words with hypens or punctuation
    punc_set = set(string.punctuation).union('—')

    return [w for _, w in words_sorted_by_length
    if not set(punc_set).intersection(set(w))][:q["meta"]["num_words"]]


@lru_cache
def get_tagged_words_for_book(book_id):
	book = load_and_strip(book_id)

	sents = [nltk.word_tokenize(str.lower(s)) for s in nltk.sent_tokenize(book)]
	tagged_sents = nltk.pos_tag_sents(sents)
	tagged_words = [w for s in tagged_sents
                      for w in s]

	return [x for x in tagged_words
            if x[0] not in all_stop_words]


def get_nouns(tagged_words):
    return [x[0] for x in tagged_words if x[1] in {"NN", "NNS", "NNP", "NNPS"}]


def get_verbs(tagged_words):
    return [x[0] for x in tagged_words if x[1] in {"VB", "VBD", "VBP"}]


def noun_to_verb_ratio_question(q):
    tagged_by_book = [get_tagged_words_for_book(
        book_id) for book_id in q["answers"]]

    counts = [dict(noun_count=len(get_nouns(w)),
          verb_count=len(get_verbs(w))) for w in tagged_by_book]

    noun_to_verb = [d["noun_count"] / d["verb_count"] for d in counts]

    correct_index = np.argmax(noun_to_verb)

    return dict(correct_answer=q["answers"][correct_index],
                data=sorted(noun_to_verb, reverse=True))


def process_question(q):
    if q["meta"]["type"] == "pos-question":
        question_res = pos_quesiton(q)
        return {**q, **dict(data=question_res["data"]), **dict(correct_answer=q.get("correct_answer", question_res.get("correct_answer")))}
    elif q["meta"]["type"] == "tf-idf":
        return {**q, **dict(data=get_tf_idf_question(q))}
    elif q["meta"]["type"] == "sent-length":
        return {**q, **sentence_length_question(q)}
    elif q["meta"]["type"] == "word-length":
        return {**q, **word_length_question(q)}
    elif q["meta"]["type"] == "unique-most-common":
        return {**q, **dict(data=get_unique_most_common(q))}
    elif q["meta"]["type"] == "unique-longest":
        return {**q, **dict(data=get_unique_longest(q))}

    raise Exception(
        f"Question type {q['meta']['type']} for meta {q['meta']} not supported")


def id_to_info(books_map, i):
    entry = books_map[i]
    return dict(id=i,
                title=entry["title"],
               author=entry["author"])


def main():
    game_data = json.loads(Path('book_data/game_1.json').read_text())
    books = game_data["books"]
    book_map = {b["id"]: b for b in books}
    answer_ids = [b["id"] for b in books]
    questions = [{**q, **dict(answers=answer_ids)} for q in game_data["questions"]]

    finished_questions = [process_question(q) for q in questions]

    final_questions = [
        {**q,
        **{"correct_answer": id_to_info(book_map, q["correct_answer"])},
        **{"answers": [id_to_info(book_map, a_id) for a_id in q["answers"]]}} for q in finished_questions
    ]

    output_path = Path.cwd().parent.parent / 'public' / 'data'
    output_path.mkdir(parents=True, exist_ok=True)
    (output_path / 'questions.json').write_text(json.dumps(dict(questions=final_questions)))


if __name__ == "__main__":
	main()