import { NextResponse } from 'next/server';
import { getCuratedArticles } from '@/server/services/knowledgeService';
import { KnowledgeCategory } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as KnowledgeCategory | null;

    const articles = getCuratedArticles(category || undefined);
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
