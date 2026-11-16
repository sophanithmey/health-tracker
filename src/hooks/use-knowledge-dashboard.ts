import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeService } from '@/services/knowledge-service';
import { HealthKnowledgeArticle, KnowledgeCategory } from '@/types';

export function useKnowledgeDashboard() {
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HealthKnowledgeArticle | null>(null);

  const { data: articles = [], isLoading } = useQuery<HealthKnowledgeArticle[]>({
    queryKey: ['knowledge', activeCategory, submittedQuery],
    queryFn: async () => {
      if (submittedQuery.trim()) {
        return knowledgeService.searchArticles(submittedQuery.trim(), activeCategory);
      }
      return knowledgeService.getTopics(activeCategory);
    }
  });

  const { data: medicationArticles = [] } = useQuery<HealthKnowledgeArticle[]>({
    queryKey: ['knowledge_meds'],
    queryFn: () => knowledgeService.getMedicationArticles('metformin'),
    enabled: activeCategory === 'medications' || activeCategory === 'all'
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim());
  };

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    submittedQuery,
    selectedArticle,
    setSelectedArticle,
    articles,
    isLoading,
    medicationArticles,
    handleSearchSubmit
  };
}
