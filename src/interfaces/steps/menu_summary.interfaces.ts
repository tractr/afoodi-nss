import { DishCategory, DishType } from './interfaces';

export interface MenuSummary {
  dishes: DishSummary[];
}

export interface DishSummary {
  dish: {
    name: string;
    type: DishType;
    price: number;
    category: DishCategory;
    ingredients: IngredientSummary[];
  };
  name: string;
  ef_score: number;
  cash_margin: number;
  afoodi_score: number;
}

export interface IngredientSummary {
  name: string;
  ef_score: number;
  proportion: number;
}
