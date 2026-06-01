import hashlib
import re
from typing import Set

def generate_sha256_hash(text: str) -> str:
    """
    Computes a cryptographic SHA-256 string hash of the input text.
    Used for cache key generations.
    """
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def tokenize_and_clean_keywords(text: str) -> Set[str]:
    """
    Converts a text block into a set of lowercased, alphanumeric word tokens,
    filtering out standard grammatical stopwords for high-quality local matching.
    """
    # 1. Lowercase and isolate words
    words = re.findall(r"\b[a-z0-9#+-]+\b", text.lower())
    
    # 2. Filter standard English stopwords
    stopwords = {
        "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", 
        "while", "of", "at", "by", "for", "with", "about", "against", "between", 
        "into", "through", "during", "before", "after", "above", "below", "to", 
        "from", "up", "down", "in", "on", "off", "over", "under", "again", "further", 
        "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", 
        "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", 
        "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", 
        "will", "just", "don", "should", "now", "i", "we", "you", "he", "she", "it", "they"
    }
    
    return {w for w in words if w not in stopwords and len(w) > 1}

def calculate_jaccard_similarity(text_a: str, text_b: str) -> float:
    """
    Calculates the Overlap Coefficient (Szymkiewicz-Simpson coefficient) between two text blocks (0.0 to 1.0).
    Unlike Jaccard, this measures containment (how much of the smaller text, e.g., the JD, is present in the larger text, e.g., the resume).
    This prevents resume length variance from dragging down perfect candidates' scores.
    """
    tokens_a = tokenize_and_clean_keywords(text_a)
    tokens_b = tokenize_and_clean_keywords(text_b)
    
    if not tokens_a or not tokens_b:
        return 0.0
        
    intersection = tokens_a.intersection(tokens_b)
    smaller_size = min(len(tokens_a), len(tokens_b))
    
    return float(len(intersection)) / smaller_size
