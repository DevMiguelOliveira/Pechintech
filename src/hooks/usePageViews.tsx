import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

interface PageViewStats {
  total_views: number;
  unique_visitors: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
}

// Gera um ID único para o visitante (armazenado no localStorage)
const getVisitorId = (): string => {
  const VISITOR_KEY = 'pechintech_visitor_id';
  let visitorId = localStorage.getItem(VISITOR_KEY);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  
  return visitorId;
};

// Verifica se já registrou visita nesta sessão
const hasVisitedThisSession = (): boolean => {
  return sessionStorage.getItem('pechintech_visited') === 'true';
};

const markVisitedThisSession = (): void => {
  sessionStorage.setItem('pechintech_visited', 'true');
};

/**
 * Hook para buscar estatísticas de visualizações
 */
export function usePageViewStats() {
  return useQuery({
    queryKey: ['page-view-stats'],
    queryFn: async (): Promise<PageViewStats> => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Total de visualizações
      const { count: totalViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      // Visitantes únicos
      const { data: uniqueData } = await supabase
        .from('page_views')
        .select('visitor_id')
        .limit(10000);
      
      const uniqueVisitors = new Set(uniqueData?.map(v => v.visitor_id)).size;

      // Visualizações hoje
      const { count: viewsToday } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      // Visualizações esta semana
      const { count: viewsThisWeek } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart);

      // Visualizações este mês
      const { count: viewsThisMonth } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      return {
        total_views: totalViews || 0,
        unique_visitors: uniqueVisitors || 0,
        views_today: viewsToday || 0,
        views_this_week: viewsThisWeek || 0,
        views_this_month: viewsThisMonth || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para registrar uma visualização de página
 */
export function useRegisterPageView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pagePath: string) => {
      const visitorId = getVisitorId();
      
      const { error } = await supabase
        .from('page_views')
        .insert({
          visitor_id: visitorId,
          page_path: pagePath,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-view-stats'] });
    },
  });
}

/**
 * Hook que automaticamente registra visita ao montar o componente
 */
export function useTrackPageView(pagePath?: string) {
  const registerView = useRegisterPageView();
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Só registra uma vez por sessão e se ainda não registrou neste componente
    if (!hasVisitedThisSession() && !hasRegistered.current) {
      hasRegistered.current = true;
      const path = pagePath || window.location.pathname;
      
      registerView.mutate(path, {
        onSuccess: () => {
          markVisitedThisSession();
        },
      });
    }
  }, [pagePath]);
}

/**
 * Hook para buscar visualizações por dia (últimos N dias)
 */
export function usePageViewsByDay(days: number = 7) {
  return useQuery({
    queryKey: ['page-views-by-day', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por dia
      const viewsByDay = new Map<string, number>();
      
      // Inicializar todos os dias com 0
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        viewsByDay.set(dateKey, 0);
      }

      // Contar visualizações por dia
      data?.forEach((view) => {
        const dateKey = new Date(view.created_at).toISOString().split('T')[0];
        viewsByDay.set(dateKey, (viewsByDay.get(dateKey) || 0) + 1);
      });

      // Converter para array
      return Array.from(viewsByDay.entries()).map(([date, views]) => ({
        date,
        views,
        label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

