export interface IngredientUsage {
  name: string;
  dishCount: number;
  totalProportion: number;
  averageEfScore: number;
  dishes: string[];
}

export interface MenuIngredientSummaryData {
  ingredients: IngredientUsage[];
}
