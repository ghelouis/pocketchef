import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default class DB {

    static init() {
        db.transaction(tx => {
            //tx.executeSql('DROP TABLE recipes')
            tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, ingredients TEXT, instructions TEXT)')
        });
    }

    static getRecipes(onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, title FROM recipes', [], onSuccess, onError)
        });
    }

    static getRecipe(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, title, ingredients, instructions FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        });
    }

    static saveRecipe(id, title, ingredients, instructions, onSaveRecipe, onSaveRecipeError) {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                [id, title, ingredients, instructions],
                onSaveRecipe, onSaveRecipeError);
        });
    }

    static updateRecipe(id, title, ingredients, instructions, onUpdate, onUpdateError) {
        db.transaction(tx => {
            tx.executeSql(
                'UPDATE recipes SET title=?, ingredients=?, instructions=? WHERE id=?',
                [title, ingredients, instructions, id],
                onUpdate, onUpdateError);
        });
    }

    static deleteRecipe(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        })
    }

}