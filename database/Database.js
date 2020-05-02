import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default class DB {

    static init() {
        db.transaction(tx => {
            //tx.executeSql('DROP TABLE recipes')
            tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, ingredients TEXT NOT NULL, instructions TEXT NOT NULL)')
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("1", "Recette 1", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("2", "Recette 2", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("3", "Recette 3", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("4", "Recette 4", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("5", "Recette 5", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("6", "Recette 6", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("7", "Recette 7", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("8", "Recette 8", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("9", "Recette 9", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("10", "Recette 10", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("11", "Recette 11", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("12", "Recette 12", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("13", "Recette 13", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("14", "Recette 14", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("15", "Recette 15", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("16", "Recette 16", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("17", "Recette 17", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("18", "Recette 18", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("19", "Recette 19", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("20", "Recette 20", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("21", "Recette 21", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("22", "Recette 22", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("23", "Recette 23", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("24", "Recette 24", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("25", "Recette 25", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("26", "Recette 26", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("27", "Recette 27", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("28", "Recette 28", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("29", "Recette 29", "T1", "I1")');
            //tx.executeSql('INSERT INTO recipes(id, title, ingredients, instructions) VALUES ("30", "Recette 30", "T1", "I1")');
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

    static saveRecipe(id, title, ingredients, instructions, onSaveRecipe) {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                [id, title, ingredients, instructions],
                onSaveRecipe);
        });
    }

    static deleteRecipe(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        })
    }

}