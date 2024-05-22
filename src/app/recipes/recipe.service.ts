import { Injectable } from '@angular/core';
import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();
  // private recipes: Recipe[] = [
  //   new Recipe(
  //     'A Test Recipe', 
  //     'This is simply a test', 
  //     'https://bing.com/th?id=OSK.ef80e15aea954d148d8ab991ab191d28',
  //   [
  //     new Ingredient('meat', 1),
  //     new Ingredient('French Fries', 20)
  //   ]),
  //   new Recipe(
  //     'Yet another Test Recipe', 
  //     'This is simply a test', 
  //     'https://bing.com/th?id=OSK.ef80e15aea954d148d8ab991ab191d28',
  //     [
  //       new Ingredient('meat', 1),
  //       new Ingredient('French Fries', 20)
  //     ]),

   
  // ];

  private recipes: Recipe[] =[];
  
  constructor(private slService: ShoppingListService) { }

  setRecipes(recipes: Recipe[]){
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes(){
    return this.recipes.slice();
  }

  getRecipe(index: number){
    return this.recipes[index];
  }

  addIngredientsToSHoppingList(ingredients: Ingredient[]){
    this.slService.addIngredients(ingredients)
  }

  addRecipe(recipe: Recipe){
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, recipe: Recipe){
    this.recipes[index] = recipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number){
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
