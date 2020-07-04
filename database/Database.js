import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default class DB {

    static init(onSuccess) {
        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, ingredients TEXT, instructions TEXT)',
                [],
                () => {
                    console.log("DB: recipes table created successfully.")
                    DB.createUtensilsTable(onSuccess)
                },
                (t, err) => DB.onError("init table recipes", err)
            )
        })
    }

    static onError(action, err) {
        console.log("DB error for " + action + ":", err)
    }

    static createUtensilsTable(onSuccess) {
        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS utensils(id TEXT PRIMARY KEY, value TEXT NOT NULL, recipe_id REFERENCES recipes(id))',
                [],
                () => {
                    console.log("DB: utensils table created successfully.")
                    onSuccess()
                },
                (t, err) => DB.onError("init table utensils", err))
        })
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

    static saveRecipe(id, title, ingredients, instructions, utensils, onSaveRecipe, onSaveRecipeError) {
        const utensilValues = utensils.map(utensil => '(?,?,?)').join(',')
        const utensilsArgs = utensils.flatMap(utensil => [DB.genUUID(), utensil, id])
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                [id, title, ingredients, instructions]);
            tx.executeSql('DELETE FROM utensils WHERE recipe_id=?',
                [id]
            )
            if (utensils.length !== 0) {
                tx.executeSql('INSERT INTO utensils(id, value, recipe_id) VALUES ' + utensilValues,
                    utensilsArgs)
            }
        }, onSaveRecipeError, onSaveRecipe);
    }

    static updateRecipe(id, title, ingredients, instructions, utensils, onUpdate) {
        const utensilValues = utensils.map(utensil => '(?,?,?)').join(',')
        const utensilsArgs = utensils.flatMap(utensil => [DB.genUUID(), utensil, id])
        db.transaction(tx => {
            tx.executeSql(
                'UPDATE recipes SET title=?, ingredients=?, instructions=? WHERE id=?',
                [title, ingredients, instructions, id]
            )
            tx.executeSql('DELETE FROM utensils WHERE recipe_id=?',
                [id]
            )
            if (utensils.length !== 0) {
                tx.executeSql('INSERT INTO utensils(id, value, recipe_id) VALUES ' + utensilValues,
                    utensilsArgs)
            }
        }, (err) => DB.onError('updating recipe ' + title + ' (' + id + ')', err), onUpdate);
    }

    static genUUID() {
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
        return id
    }
    static deleteRecipe(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        })
    }

    static getUtensils(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, value FROM utensils WHERE recipe_id=?', [recipeId], onSuccess, onError)
        })
    }
}