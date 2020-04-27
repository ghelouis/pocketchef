import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default class DB {

    static init() {
        db.transaction(tx => {
            // TODO: add NOT NULL to recipes.userId
            // TODO: add first screen with no nav to enter name 'Chef's name: '
            // TODO: display Chef's name constantly on app *chef-hat* <name> -> clicking on it allows to change name or log in as someone else?
            tx.executeSql('CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, ingredients TEXT NOT NULL, instructions TEXT NOT NULL, userId TEXT, FOREIGN KEY(userId) REFERENCES users(id))')
        });
    }

    static getRecipes(onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, title FROM recipes', [], onSuccess, onError)
        });
    }

    static saveRecipe(id, title, ingredients, instructions, onSaveRecipe) {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                [id, title, ingredients, instructions],
                onSaveRecipe);
        });
    }

}