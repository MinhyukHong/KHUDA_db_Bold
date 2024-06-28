from transformers import MBartForConditionalGeneration, MBart50TokenizerFast, BartTokenizer, BartForConditionalGeneration
from konlpy.tag import Okt
from sklearn.feature_extraction.text import TfidfVectorizer
import re

class NLPProcessor:
    def __init__(self):
        print("Loading translation models...")
        self.translator_model = MBartForConditionalGeneration.from_pretrained('facebook/mbart-large-50-many-to-many-mmt')
        self.translator_tokenizer = MBart50TokenizerFast.from_pretrained('facebook/mbart-large-50-many-to-many-mmt')
        
        print("Loading tokenizer and model for other tasks...")
        self.tokenizer = BartTokenizer.from_pretrained('gogamza/kobart-base-v2')
        self.model = BartForConditionalGeneration.from_pretrained('gogamza/kobart-base-v2')
        self.okt = Okt()
        print("All models loaded.")

    def clean_text(self, text):
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def analyze_text(self, text):
        if not text.strip():
            return []

        inputs = self.tokenizer(text, return_tensors='pt', max_length=1024, truncation=True)
        outputs = self.model.generate(inputs['input_ids'], max_length=50, num_beams=4, early_stopping=True)
        
        result = [self.tokenizer.decode(g, skip_special_tokens=True) for g in outputs]
        return result

    def extract_keywords(self, text):
        document = self.clean_text(text)
        nouns = self.okt.nouns(document)
        
        if not nouns:
            return []
        
        tfidf_vectorizer = TfidfVectorizer(tokenizer=self.okt.nouns, max_features=10)
        documents = [' '.join(nouns)]
        tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
        tfidf_scores = tfidf_matrix.toarray()[0]
        word_tfidf = list(zip(tfidf_vectorizer.get_feature_names_out(), tfidf_scores))
        sorted_word_tfidf = sorted(word_tfidf, key=lambda x: x[1], reverse=True)
        most_important_words = [word for word, score in sorted_word_tfidf[:5]]
        
        return most_important_words
    
    def extract_important_sentences(self, text):
        sentences = re.split(r'(?<!\d)([.!?]+)(?!\d)', text)
        full_sentences = ["".join(i) for i in zip(sentences[0::2], sentences[1::2])]

        if len(sentences) % 2 != 0:
            full_sentences.append(sentences[-1])

        tfidf_vectorizer = TfidfVectorizer(max_features=5)
        tfidf_matrix = tfidf_vectorizer.fit_transform(full_sentences)
        tfidf_scores = tfidf_matrix.sum(axis=1).A1
        sentence_tfidf = list(zip(full_sentences, tfidf_scores))
        sorted_sentence_tfidf = sorted(sentence_tfidf, key=lambda x: x[1], reverse=True)
        most_important_sentences = [sentence for sentence, score in sorted_sentence_tfidf[:5]]
        
        return most_important_sentences


nlp_processor = NLPProcessor()

def extract_key_sentences_and_words(text):
    key_sentences = nlp_processor.extract_important_sentences(text)
    words = nlp_processor.extract_keywords(text)
    return key_sentences, words