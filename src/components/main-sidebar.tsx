'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  User2,
  ChevronUp,
  Monitor,
  LogOut,
  LucideProps,
  Info,
  Plus,
  Menu,
  Lock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import supabaseClient from '@/lib/supabase-client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';
import { SettingsModal } from '@/components/settings-modal';
import { useTranslations } from 'next-intl';

// Menu items
const items: Array<{
  titleKey: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  external?: boolean;
}> = [
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

export default function MainSidebar() {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const t = useTranslations();
  const { setOpenMobile } = useSidebar();

  const _logout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
    }
    window.location.reload();
  };

  return (
    <Sidebar className="z-10 bg-background shadow-md">
      <SidebarHeader>
        <div className="flex items-center justify-between p-4 md:justify-center">
          <Image src="/images/logo.svg" alt={t('common.logo')} width={130} height={100} />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-4 pb-4">
          <Link href="/menus/new" className="w-full">
            <Button
              variant="outline"
              size="default"
              className="w-full border-0 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-sm font-medium">{t('menus.add')}</span>
            </Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.mainMenu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    className={!item.external && pathname === item.url ? 'bg-accent' : ''}
                  >
                    <Link
                      href={item.url}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {t(item.titleKey)}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
              <ChevronUp className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
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
            <DropdownMenuItem onClick={_logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('navigation.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </Sidebar>
  );
}
