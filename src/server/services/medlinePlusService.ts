// ============================================================================
// MedlinePlus Web Service Client (Server-side Only)
// Official Documentation: https://medlineplus.gov/webservices/
// ============================================================================

import { HealthKnowledgeArticle } from '@/types';

interface CacheEntry {
  timestamp: number;
  data: HealthKnowledgeArticle[];
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour TTL

/**
 * Safely unescapes XML and HTML entities and strips internal highlight tags
 */
export function cleanXmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<span class="qt\d+">/gi, '')
    .replace(/<\/span>/gi, '')
    .trim();
}

/**
 * Safely strips all HTML tags to create plain-text summaries
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Robust XML parser for MedlinePlus NLM Search Results
 */
export function parseMedlineXml(xml: string): HealthKnowledgeArticle[] {
  const articles: HealthKnowledgeArticle[] = [];
  const docRegex = /<document\s+rank="(\d+)"\s+url="([^"]+)">([\s\S]*?)<\/document>/g;

  let match: RegExpExecArray | null;
  while ((match = docRegex.exec(xml)) !== null) {
    const url = match[2];
    const docContent = match[3];

    // Extract title
    const titleMatch = /<content\s+name="title">([\s\S]*?)<\/content>/i.exec(docContent);
    const title = titleMatch ? cleanXmlText(titleMatch[1]) : 'Diabetes Education Topic';

    // Extract organization
    const orgMatch = /<content\s+name="organizationName">([\s\S]*?)<\/content>/i.exec(docContent);
    const sourceName = orgMatch ? cleanXmlText(orgMatch[1]) : 'National Library of Medicine (NIH)';

    // Extract snippet
    const snippetMatch = /<content\s+name="snippet">([\s\S]*?)<\/content>/i.exec(docContent);
    const snippet = snippetMatch ? cleanXmlText(snippetMatch[1]) : '';

    // Extract full summary
    const summaryMatch = /<content\s+name="FullSummary">([\s\S]*?)<\/content>/i.exec(docContent);
    const rawSummary = summaryMatch ? cleanXmlText(summaryMatch[1]) : '';

    const plainSummary = rawSummary ? stripHtml(rawSummary).slice(0, 320) + '...' : stripHtml(snippet);

    // Extract MeSH tags
    const meshTags: string[] = [];
    const meshRegex = /<content\s+name="mesh">([\s\S]*?)<\/content>/gi;
    let meshMatch: RegExpExecArray | null;
    while ((meshMatch = meshRegex.exec(docContent)) !== null) {
      const tag = cleanXmlText(meshMatch[1]);
      if (tag && !meshTags.includes(tag)) {
        meshTags.push(tag);
      }
    }

    // Determine category based on content
    let category: HealthKnowledgeArticle['category'] = 'understanding';
    const lowerText = (title + ' ' + rawSummary).toLowerCase();
    if (lowerText.includes('hypoglycemia') || lowerText.includes('hyperglycemia') || lowerText.includes('low blood sugar') || lowerText.includes('high blood sugar')) {
      category = 'hypo_hyper';
    } else if (lowerText.includes('glucose test') || lowerText.includes('blood sugar test') || lowerText.includes('finger prick') || lowerText.includes('meter')) {
      category = 'testing_guide';
    } else if (lowerText.includes('a1c') || lowerText.includes('hba1c') || lowerText.includes('glucose level') || lowerText.includes('glycated')) {
      category = 'glucose_hba1c';
    } else if (lowerText.includes('insulin') || lowerText.includes('metformin') || lowerText.includes('drug') || lowerText.includes('medication')) {
      category = 'medications';
    } else if (lowerText.includes('diet') || lowerText.includes('food') || lowerText.includes('meal') || lowerText.includes('nutrition') || lowerText.includes('carb')) {
      category = 'nutrition';
    }

    const id = 'mlp-' + (url.split('/').pop()?.replace('.html', '') || Math.random().toString(36).slice(2, 8));

    articles.push({
      id,
      category,
      title,
      titleKm: '', // Populated by bilingual mapper or fallback
      summary: plainSummary,
      summaryKm: '',
      contentHtml: rawSummary || `<p>${plainSummary}</p>`,
      sourceName,
      sourceUrl: url,
      lastReviewed: new Date().toISOString().split('T')[0],
      tags: meshTags.length > 0 ? meshTags : ['Diabetes Education', 'NIH', 'MedlinePlus'],
      isCurated: false
    });
  }

  return articles;
}

/**
 * Searches the official MedlinePlus Web Service
 */
export async function searchMedlinePlus(query: string, maxResults = 8): Promise<HealthKnowledgeArticle[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${normalizedQuery}_${maxResults}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(normalizedQuery)}&retmax=${maxResults}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'FamilyDiabetesCare/1.0 (Health Education Module; educational family care)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`MedlinePlus Web Service error: ${response.status} ${response.statusText}`);
      return [];
    }

    const xmlText = await response.text();
    const articles = parseMedlineXml(xmlText);

    // Save in cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: articles
    });

    return articles;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('Error fetching from MedlinePlus Web Service:', error.message || error);
    return [];
  }
}
