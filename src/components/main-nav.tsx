'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import supabaseClient from '@/lib/supabase-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User2, Monitor, LogOut, Menu, Plus, Info, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SettingsModal } from '@/components/settings-modal';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const items = [
  {
    titleKey: 'navigation.home',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'navigation.about',
    url: 'http://afoodi.io/',
    icon: Info,
    external: true,
  },
];

export function MainNav() {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const t = useTranslations();

  const logout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
    }
    window.location.reload();
  };

  return (
    <div className="bg-white shadow-md">
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <div className="flex h-16 items-center px-6">
          {/* Burger Menu (Mobile) */}
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t('navigation.mobile.menu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          {/* Logo */}
          <Link
            href="/"
            className="ml-2 transition-all hover:opacity-80 md:ml-0"
            aria-label={t('common.logo')}
          >
            <Image src="/images/logo.svg" alt={t('common.logo')} width={100} height={40} />
          </Link>

          {/* Main Menu and Profile (Desktop only) */}
          <nav
            className="ml-6 hidden items-center space-x-2 md:flex"
            aria-label={t('navigation.mainMenu')}
          >
            {items.map(item =>
              item.external ? (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex h-9 items-center space-x-2 rounded-md px-3 text-sm font-medium transition-colors hover:text-primary',
                    'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{t(item.titleKey)}</span>
                </a>
              ) : (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    'flex h-9 items-center space-x-2 rounded-md px-3 text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.url ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{t(item.titleKey)}</span>
                </Link>
              )
            )}

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-9 items-center space-x-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <User2 className="h-4 w-4" />
                  <span>{t('navigation.profile')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>{t('navigation.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/change-password">
                    <Lock className="mr-2 h-4 w-4" />
                    <span>{t('navigation.changePassword')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('navigation.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Add Menu CTA */}
          <div className="ml-4 flex items-center">
            <Link href="/menus/new">
              <Button
                variant="outline"
                size="default"
                className="h-9 border-0 bg-brand px-3 text-brand-foreground hover:bg-brand/90"
              >
                <Plus className="mr-1 h-4 w-4" />
                <span className="text-sm font-medium">{t('menus.add')}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <Image src="/images/logo.svg" alt={t('common.logo')} width={130} height={100} />
            </div>
            <nav className="flex-1 p-4" aria-label={t('navigation.mobile.menu')}>
              {items.map(item => (
                <Link
                  key={item.url}
                  href={item.url}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'mb-2 flex h-9 items-center space-x-2 rounded-md px-3 text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.url ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{t(item.titleKey)}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex h-9 w-full items-center justify-between px-3 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <div className="flex items-center">
                      <User2 className="mr-2 h-4 w-4" />
                      <span>{currentUser?.data?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>{t('navigation.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/change-password">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>{t('navigation.changePassword')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navigation.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
