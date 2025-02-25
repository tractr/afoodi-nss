'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tables } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import supabaseClient from '@/lib/supabase-client';
import { useCallback, useEffect, useState } from 'react';

type Menu = Tables<'menus'>;
const CACHE_PREFIX = 'menu_image_';
const CACHE_EXPIRY_PREFIX = 'menu_image_expiry_';
const CACHE_DURATION = 3000; // Cache for 50 minutes (slightly less than the signed URL expiry)

interface MenusDataTableProps {
  menus: Menu[];
}

export function MenusDataTable({ menus }: MenusDataTableProps) {
  const t = useTranslations();
  const router = useRouter();
  const [menuImages, setMenuImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const getCachedImageUrl = useCallback((menuId: string): string | null => {
    try {
      const cachedUrl = localStorage.getItem(CACHE_PREFIX + menuId);
      const expiryTime = localStorage.getItem(CACHE_EXPIRY_PREFIX + menuId);

      if (cachedUrl && expiryTime && Number(expiryTime) > Date.now()) {
        return cachedUrl;
      }

      // Clear expired cache
      if (cachedUrl || expiryTime) {
        localStorage.removeItem(CACHE_PREFIX + menuId);
        localStorage.removeItem(CACHE_EXPIRY_PREFIX + menuId);
      }
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
    }
    return null;
  }, []);

  const cacheImageUrl = useCallback((menuId: string, url: string) => {
    try {
      localStorage.setItem(CACHE_PREFIX + menuId, url);
      localStorage.setItem(
        CACHE_EXPIRY_PREFIX + menuId,
        (Date.now() + CACHE_DURATION * 1000).toString()
      );
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, []);

  const getMenuImageUrl = useCallback(
    async (menu: Menu) => {
      if (!menu.file_bucket || !menu.file_path) return null;

      // Check cache first
      const cachedUrl = getCachedImageUrl(menu.id);
      if (cachedUrl) return cachedUrl;

      try {
        const { data, error } = await supabaseClient.storage
          .from(menu.file_bucket)
          .createSignedUrl(menu.file_path, 3600);

        if (error) {
          console.error('Error getting signed URL:', error);
          return null;
        }

        // Cache the new URL
        cacheImageUrl(menu.id, data.signedUrl);
        return data.signedUrl;
      } catch (error) {
        console.error('Error getting signed URL:', error);
        return null;
      }
    },
    [getCachedImageUrl, cacheImageUrl]
  );

  useEffect(() => {
    const loadImages = async () => {
      const imageUrls: Record<string, string> = {};
      const loadingStates: Record<string, boolean> = {};

      for (const menu of menus) {
        // Only load if we don't already have the image URL
        if (!menuImages[menu.id]) {
          loadingStates[menu.id] = true;
          setLoadingImages(prev => ({ ...prev, [menu.id]: true }));

          const url = await getMenuImageUrl(menu);
          if (url) {
            imageUrls[menu.id] = url;
          }
          loadingStates[menu.id] = false;
        }
      }

      if (Object.keys(imageUrls).length > 0) {
        setMenuImages(prev => ({ ...prev, ...imageUrls }));
      }
      setLoadingImages(prev => ({ ...prev, ...loadingStates }));
    };

    loadImages();
  }, [menus, getMenuImageUrl]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('menus.table.columns.image')}</TableHead>
          <TableHead>{t('menus.table.columns.name')}</TableHead>
          <TableHead>{t('menus.table.columns.version')}</TableHead>
          <TableHead>{t('menus.table.columns.createdAt')}</TableHead>
          <TableHead>{t('menus.table.columns.updatedAt')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menus.map(menu => {
          const imageUrl = menuImages[menu.id];
          const isLoading = loadingImages[menu.id];

          return (
            <TableRow
              key={menu.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => router.push(`/menus/${menu.id}`)}
            >
              <TableCell>
                <div className="relative block aspect-square w-16">
                  {isLoading ? (
                    <Skeleton className="h-full w-full rounded-md" />
                  ) : imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={menu.label}
                        fill
                        className="rounded-md object-cover object-top"
                        sizes="64px"
                      />
                      <div className="absolute inset-0 rounded-md bg-black/20" />
                    </>
                  ) : (
                    <div className="h-full w-full rounded-md bg-muted" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span>{menu.label}</span>
              </TableCell>
              <TableCell>
                <span
                  className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                  style={{ backgroundColor: '#849F78', color: 'white' }}
                >
                  {t('menus.table.version', { number: menu.version })}
                </span>
              </TableCell>
              <TableCell>{format(new Date(menu.created_at), 'PPP', { locale: fr })}</TableCell>
              <TableCell>
                {menu.updated_date
                  ? format(new Date(menu.updated_date), 'PPP', { locale: fr })
                  : t('menus.table.noUpdate')}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
