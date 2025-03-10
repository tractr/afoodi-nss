'use client';

import { MenusDataTable } from './menus-data-table';
import { MenusGridView } from './menus-grid-view';
import supabaseClient from '@/lib/supabase-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface MenusViewProps {
  className?: string;
  isGridView: boolean;
  sortBy: 'newest' | 'oldest' | 'name' | 'version';
}

export function MenusView({ className, isGridView, sortBy }: MenusViewProps) {
  const { data: menus = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from('menus')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const sortedMenus = useMemo(() => {
    const menusData = [...menus];

    switch (sortBy) {
      case 'newest':
        return menusData.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return menusData.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'name':
        return menusData.sort((a, b) => a.label.localeCompare(b.label));
      case 'version':
        return menusData.sort((a, b) => b.version - a.version);
      default:
        return menusData;
    }
  }, [sortBy, menus]);

  return (
    <div className={className}>
      {isGridView ? (
        <MenusGridView menus={sortedMenus} />
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <MenusDataTable menus={sortedMenus} />
        </div>
      )}
    </div>
  );
}
