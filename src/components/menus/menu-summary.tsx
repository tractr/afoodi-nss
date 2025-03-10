import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MenuSummary as MenuSummaryType } from '@/interfaces/steps/menu_summary.interfaces';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MenuSummaryProps {
  data: MenuSummaryType;
}

export function MenuSummary({ data }: MenuSummaryProps) {
  const t = useTranslations();

  // Sort dishes by name
  const sortedDishes = [...data.dishes].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('menus.summary.name')}</TableHead>
            <TableHead>{t('menus.summary.category')}</TableHead>
            <TableHead>{t('menus.summary.type')}</TableHead>
            <TableHead className="text-right">{t('menus.summary.ingredients')}</TableHead>
            <TableHead className="text-right">{t('menus.summary.price')}</TableHead>
            <TableHead className="text-right">{t('menus.summary.efScore')}</TableHead>
            <TableHead className="text-right">{t('menus.summary.margin')}</TableHead>
            <TableHead className="text-right">{t('menus.summary.afoodiScore')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDishes.map(dish => (
            <TableRow key={dish.name}>
              <TableCell className="font-medium">{dish.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{dish.dish.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{dish.dish.type}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center justify-end gap-1">
                        <span>{dish.dish.ingredients.length}</span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="mb-1 font-semibold">
                          {t('menus.summary.ingredientsList')}:
                        </div>
                        <ul className="list-inside list-disc">
                          {dish.dish.ingredients.map(ingredient => (
                            <li key={ingredient.name}>
                              {ingredient.name} ({(ingredient.proportion * 100).toFixed(1)}%)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">{dish.dish.price}€</TableCell>
              <TableCell className="text-right">{dish.ef_score.toFixed(2)}</TableCell>
              <TableCell className="text-right">{dish.cash_margin.toFixed(2)}€</TableCell>
              <TableCell className="text-right">{dish.afoodi_score.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
