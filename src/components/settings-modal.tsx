import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { setLanguageCookie } from '@/lib/cookies';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
] as const;

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const router = useRouter();
  const t = useTranslations();
  const [language, setLanguage] = useState<string>('en');

  // Get initial language from cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find(cookie => cookie.trim().startsWith('NEXT_LOCALE='));
    if (langCookie) {
      setLanguage(langCookie.split('=')[1]);
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setLanguage(newLocale);
    setLanguageCookie(newLocale);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language.label')}</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder={t('settings.language.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
