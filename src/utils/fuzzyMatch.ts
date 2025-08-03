/**
 * Fuzzy matching utilities for chatbot responses
 * Implements Levenshtein distance and text normalization for better matching
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity percentage between two strings using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Normalize text for better matching
 * - Convert to lowercase
 * - Remove punctuation and special characters
 * - Normalize whitespace
 * - Trim leading/trailing spaces
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
}

/**
 * Extract meaningful keywords from text (words longer than 2 characters)
 */
export function extractKeywords(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter(word => word.length > 2);
}

/**
 * Calculate keyword overlap similarity between two texts
 */
export function calculateKeywordSimilarity(text1: string, text2: string): number {
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);
  
  if (keywords1.length === 0 && keywords2.length === 0) return 100;
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const commonKeywords = keywords1.filter(keyword => 
    keywords2.some(k2 => calculateSimilarity(keyword, k2) > 80)
  );
  
  const maxKeywords = Math.max(keywords1.length, keywords2.length);
  return (commonKeywords.length / maxKeywords) * 100;
}

/**
 * Calculate combined similarity score using multiple algorithms
 */
export function calculateCombinedSimilarity(userText: string, questionText: string): number {
  const normalizedUser = normalizeText(userText);
  const normalizedQuestion = normalizeText(questionText);
  
  // Direct string similarity (40% weight)
  const stringSimilarity = calculateSimilarity(normalizedUser, normalizedQuestion);
  
  // Keyword similarity (60% weight)
  const keywordSimilarity = calculateKeywordSimilarity(userText, questionText);
  
  // Combined weighted score
  return (stringSimilarity * 0.4) + (keywordSimilarity * 0.6);
}

/**
 * Find the best matching FAQ entry for a user query
 */
export interface FAQEntry {
  question: string;
  answer: string;
}

export interface MatchResult {
  faq: FAQEntry;
  similarity: number;
}

export function findBestFAQMatch(
  userQuery: string,
  faqEntries: FAQEntry[],
  threshold: number = 70
): MatchResult | null {
  if (!faqEntries || faqEntries.length === 0) {
    return null;
  }

  let bestMatch: MatchResult | null = null;
  let highestScore = 0;

  for (const faq of faqEntries) {
    const similarity = calculateCombinedSimilarity(userQuery, faq.question);
    
    if (similarity > highestScore && similarity >= threshold) {
      highestScore = similarity;
      bestMatch = {
        faq,
        similarity
      };
    }
  }

  return bestMatch;
}