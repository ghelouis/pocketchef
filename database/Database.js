import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default class DB {

    static init(onSuccess) {
        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, nb_person INTEGER NOT NULL)',
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
            tx.executeSql('CREATE TABLE IF NOT EXISTS utensils(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT NOT NULL, recipe_id REFERENCES recipes(id))',
                [],
                () => {
                    console.log("DB: utensils table created successfully.")
                    DB.createIngredientsTable(onSuccess)
                },
                (t, err) => DB.onError("init table utensils", err))
        })
    }

    static createIngredientsTable(onSuccess) {
        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ingredients(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT NOT NULL, quantity REAL, unit TEXT, recipe_id REFERENCES recipes(id))',
                [],
                () => {
                    console.log("DB: ingredients table created successfully.")
                    DB.createInstructionsTable(onSuccess)
                },
                (t, err) => DB.onError("init table ingredients", err))
        })
    }

    static createInstructionsTable(onSuccess) {
        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS instructions(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT NOT NULL, recipe_id REFERENCES recipes(id))',
                [],
                () => {
                    console.log("DB: instructions table created successfully.")
                    onSuccess()
                },
                (t, err) => DB.onError("init table instructions", err))
        })
    }

    static getRecipes(onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, title FROM recipes', [], onSuccess, onError)
        });
    }

    static getRecipe(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, title, nb_person FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        });
    }

    static getNbPerson(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT nb_person FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
        });
    }

    static saveRecipe(id, title, nbPerson, ingredients, instructions, utensils, onSaveRecipe, onSaveRecipeError) {
        const utensilValues = utensils.map(() => '(?,?,?,?)').join(',')
        const utensilsArgs = utensils.flatMap(utensil => [DB.genUUID(), utensil.step, utensil.value, id])
        const ingredientValues = ingredients.map(() => '(?,?,?,?,?,?)').join(',')
        const ingredientsArgs = ingredients.flatMap(ingredient => [DB.genUUID(), ingredient.step, ingredient.quantity, ingredient.unit, ingredient.value, id])
        const instructionValues = instructions.map(() => '(?,?,?,?)').join(',')
        const instructionsArgs = instructions.flatMap(instruction => [DB.genUUID(), instruction.step, instruction.value, id])
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, nb_person) VALUES (?,?,?)',
                [id, title, nbPerson]);
            if (utensils.length > 0) {
                tx.executeSql('INSERT INTO utensils(id, step, value, recipe_id) VALUES ' + utensilValues,
                    utensilsArgs)
            }
            if (ingredients.length > 0) {
                tx.executeSql('INSERT INTO ingredients(id, step, quantity, unit, value, recipe_id) VALUES ' + ingredientValues,
                    ingredientsArgs)
            }
            if (instructions.length > 0) {
                tx.executeSql('INSERT INTO instructions(id, step, value, recipe_id) VALUES ' + instructionValues,
                    instructionsArgs)
            }
        }, onSaveRecipeError, onSaveRecipe);
    }

    static updateRecipe(id, title, nbPerson, ingredients, instructions, utensils, onUpdate) {
        const utensilValues = utensils.map(() => '(?,?,?,?)').join(',')
        const utensilsArgs = utensils.flatMap(utensil => [DB.genUUID(), utensil.step, utensil.value, id])
        const ingredientValues = ingredients.map(() => '(?,?,?,?,?,?)').join(',')
        const ingredientsArgs = ingredients.flatMap(ingredient => [DB.genUUID(), ingredient.step, ingredient.quantity, ingredient.unit, ingredient.value, id])
        const instructionValues = instructions.map(() => '(?,?,?,?)').join(',')
        const instructionsArgs = instructions.flatMap(instruction => [DB.genUUID(), instruction.step, instruction.value, id])
        db.transaction(tx => {
            tx.executeSql(
                'UPDATE recipes SET title=?, nb_person=? WHERE id=?',
                [title, nbPerson, id]
            )
            tx.executeSql('DELETE FROM utensils WHERE recipe_id=?',
                [id]
            )
            tx.executeSql('DELETE FROM ingredients WHERE recipe_id=?',
                [id]
            )
            tx.executeSql('DELETE FROM instructions WHERE recipe_id=?',
                [id]
            )
            if (utensils.length > 0) {
                tx.executeSql('INSERT INTO utensils(id, step, value, recipe_id) VALUES ' + utensilValues,
                    utensilsArgs)
            }
            if (ingredients.length > 0) {
                tx.executeSql('INSERT INTO ingredients(id, step, quantity, unit, value, recipe_id) VALUES ' + ingredientValues,
                    ingredientsArgs)
            }
            if (instructions.length > 0) {
                tx.executeSql('INSERT INTO instructions(id, step, value, recipe_id) VALUES ' + instructionValues,
                    instructionsArgs)
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
            tx.executeSql('DELETE FROM recipes WHERE id=?', [recipeId])
            tx.executeSql('DELETE FROM utensils WHERE recipe_id=?', [recipeId])
            tx.executeSql('DELETE FROM ingredients WHERE recipe_id=?', [recipeId])
            tx.executeSql('DELETE FROM instructions WHERE recipe_id=?', [recipeId])
        }, onError, onSuccess)
    }

    static getUtensils(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, step, value FROM utensils WHERE recipe_id=?', [recipeId], onSuccess, onError)
        })
    }

    static getIngredients(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, step, quantity, unit, value FROM ingredients WHERE recipe_id=?', [recipeId], onSuccess, onError)
        })
    }

    static getInstructions(recipeId, onSuccess, onError) {
        db.transaction(tx => {
            tx.executeSql('SELECT id, step, value FROM instructions WHERE recipe_id=?', [recipeId], onSuccess, onError)
        })
    }
}