// utils/stopWords.js

const stopWords = [
    // Articles
    'a', 'an', 'the',
  
    // Conjunctions
    'and', 'or', 'but', 'nor', 'so', 'for', 'yet',
  
    // Prepositions
    'in', 'on', 'at', 'by', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
    'up', 'down', 'under', 'over', 'again', 'further',
  
    // Pronouns / Determiners
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 
    'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 
    'ours', 'theirs', 'this', 'that', 'these', 'those',
  
    // Temporal Adverbs / Connecting Words
    'now', 'then', 'when', 'while', 'once', 'already', 'soon', 'today', 
    'tomorrow', 'yesterday',
  
    // Auxiliary Verbs / Helping Verbs
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 
    'did', 'has', 'have', 'had', 'will', 'shall', 'would', 'should', 'can', 
    'could', 'may', 'might', 'must', 'ought',
  
    // Adverbs / Adjectives of Degree / Quantity
    'very', 'too', 'also', 'just', 'only', 'even', 'more', 'much', 'less', 
    'most', 'least', 'enough', 'rather', 'quite', 'many', 'own',
  
    // Question Words / Relative Pronouns
    'who', 'whom', 'whose', 'which', 'what', 'where', 'why', 'how', 
    'whether', 'whenever',
  
    // Vague or General Words
    'thing', 'things', 'stuff', 'number', 'numbers', 'fact', 'facts', 
    'case', 'cases', 'point', 'points', 'way', 'ways', 'people', 'someone', 
    'everyone', 'something', 'anything', 'nothing',
  
    // Contractions / Possessives
    "it's", "i'm", "you're", "he's", "she's", "we're", "they're", "here's", 
    "there's", "let's", "can't", "won't", "wouldn't", "haven't", "doesn't", 
    "isn't", "aren't", "wasn't", "weren't",
  
    // Filler Words
    'really', 'basically', 'actually', 'literally', 'probably', 'perhaps', 
    'maybe',
  
    // Special Cases
    ',', '.', '!', '?', ':', ';', '-', '_', '(', ')', '"', "'"
  ];
  
  module.exports = stopWords;
  