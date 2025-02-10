import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MenuSummary } from '@/interfaces/steps/menu_summary.interfaces';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MenuIngredientSummaryProps {
  data: MenuSummary;
}

export function MenuIngredientSummary({ data }: MenuIngredientSummaryProps) {
  const t = useTranslations();

  // Process ingredients to get usage statistics
  const ingredientStats = data.dishes.reduce(
    (acc, dish) => {
      dish.dish.ingredients.forEach(ingredient => {
        if (!acc[ingredient.name]) {
          acc[ingredient.name] = {
            name: ingredient.name,
            dishCount: 0,
            totalProportion: 0,
            totalEfScore: 0,
            dishes: new Set<string>(),
          };
        }
        acc[ingredient.name].dishCount += 1;
        acc[ingredient.name].totalProportion += ingredient.proportion;
        acc[ingredient.name].totalEfScore += ingredient.ef_score;
        acc[ingredient.name].dishes.add(dish.name);
      });
      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        dishCount: number;
        totalProportion: number;
        totalEfScore: number;
        dishes: Set<string>;
      }
    >
  );

  const ingredientList = Object.values(ingredientStats)
    .map(stat => ({
      ...stat,
      averageProportion: stat.totalProportion / stat.dishCount,
      averageEfScore: stat.totalEfScore / stat.dishCount,
      dishes: Array.from(stat.dishes),
    }))
    .sort((a, b) => b.dishCount - a.dishCount);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('menus.ingredients.name')}</TableHead>
            <TableHead className="text-right">{t('menus.ingredients.dishCount')}</TableHead>
            <TableHead className="text-right">{t('menus.ingredients.avgProportion')}</TableHead>
            <TableHead className="text-right">{t('menus.ingredients.avgEfScore')}</TableHead>
            <TableHead>{t('menus.ingredients.usedIn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredientList.map(ingredient => (
            <TableRow key={ingredient.name}>
              <TableCell className="font-medium">{ingredient.name}</TableCell>
              <TableCell className="text-right">{ingredient.dishCount}</TableCell>
              <TableCell className="text-right">
                {(ingredient.averageProportion * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">{ingredient.averageEfScore.toFixed(2)}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[200px]">
                          {ingredient.dishes.slice(0, 2).join(', ')}
                          {ingredient.dishes.length > 2 ? '...' : ''}
                        </span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul className="list-disc list-inside">
                        {ingredient.dishes.map(dish => (
                          <li key={dish}>{dish}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
