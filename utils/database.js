import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

/* ____________ Init  ____________  */

export function initDB(onSuccess) {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT NOT NULL, nb_person INTEGER NOT NULL, notes TEXT)',
            [],
            () => {
                console.log("DB: recipes table created successfully.")
                createUtensilsTable(onSuccess)
            },
            (t, err) => onError("init table recipes", err)
        )
    })
}

function createUtensilsTable(onSuccess) {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS utensils(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT NOT NULL, recipe_id REFERENCES recipes(id))',
            [],
            () => {
                console.log("DB: utensils table created successfully.")
                createIngredientsTable(onSuccess)
            },
            (t, err) => onError("init table utensils", err))
    })
}

function createIngredientsTable(onSuccess) {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ingredients(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT, quantity TEXT, unit TEXT, recipe_id REFERENCES recipes(id))',
            [],
            () => {
                console.log("DB: ingredients table created successfully.")
                createInstructionsTable(onSuccess)
            },
            (t, err) => onError("init table ingredients", err))
    })
}

function createInstructionsTable(onSuccess) {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS instructions(id TEXT PRIMARY KEY, step INTEGER NOT NULL, value TEXT NOT NULL, recipe_id REFERENCES recipes(id))',
            [],
            () => {
                console.log("DB: instructions table created successfully.")
                onSuccess()
            },
            (t, err) => onError("init table instructions", err))
    })
}

/* ____________ Get  ____________  */

export function getRecipesFromDB(onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT id, title FROM recipes', [], onSuccess, onError)
    });
}

export function getRecipeFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT id, title, nb_person, notes FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
    });
}

export function getNbPersonFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT nb_person FROM recipes WHERE id=?', [recipeId], onSuccess, onError)
    });
}

export function getUtensilsFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT id, step, value FROM utensils WHERE recipe_id=?', [recipeId], onSuccess, onError)
    })
}

export function getIngredientsFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT id, step, quantity, unit, value FROM ingredients WHERE recipe_id=?', [recipeId], onSuccess, onError)
    })
}

export function getInstructionsFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('SELECT id, step, value FROM instructions WHERE recipe_id=?', [recipeId], onSuccess, onError)
    })
}

/* ____________ Update  ____________  */

export function saveRecipeToDB(id, title, nbPerson, ingredients, instructions, utensils, notes, onSaveRecipe, onSaveRecipeError) {
    const utensilValues = utensils.map(() => '(?,?,?,?)').join(',')
    const utensilsArgs = utensils.flatMap(utensil => [genUUID(), utensil.step, utensil.value, id])
    const ingredientValues = ingredients.map(() => '(?,?,?,?,?,?)').join(',')
    const ingredientsArgs = ingredients.flatMap(ingredient => [genUUID(), ingredient.step, ingredient.quantity, ingredient.unit, ingredient.value, id])
    const instructionValues = instructions.map(() => '(?,?,?,?)').join(',')
    const instructionsArgs = instructions.flatMap(instruction => [genUUID(), instruction.step, instruction.value, id])
    db.transaction(tx => {
        tx.executeSql(
            'INSERT INTO recipes(id, title, nb_person, notes) VALUES (?,?,?,?)',
            [id, title, nbPerson, notes]);
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

export function updateRecipeInDB(id, title, nbPerson, ingredients, instructions, utensils, notes, onUpdate) {
    const utensilValues = utensils.map(() => '(?,?,?,?)').join(',')
    const utensilsArgs = utensils.flatMap(utensil => [genUUID(), utensil.step, utensil.value, id])
    const ingredientValues = ingredients.map(() => '(?,?,?,?,?,?)').join(',')
    const ingredientsArgs = ingredients.flatMap(ingredient => [genUUID(), ingredient.step, ingredient.quantity, ingredient.unit, ingredient.value, id])
    const instructionValues = instructions.map(() => '(?,?,?,?)').join(',')
    const instructionsArgs = instructions.flatMap(instruction => [genUUID(), instruction.step, instruction.value, id])
    db.transaction(tx => {
        tx.executeSql(
            'UPDATE recipes SET title=?, nb_person=?, notes=? WHERE id=?',
            [title, nbPerson, notes, id]
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
    }, (err) => onError('updating recipe ' + title + ' (' + id + ')', err), onUpdate);
}

function onError(action, err) {
    console.log("DB error for " + action + ":", err)
    return false
}

function genUUID() {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
    return id
}

/* ____________ Delete  ____________  */

export function deleteRecipeFromDB(recipeId, onSuccess, onError) {
    db.transaction(tx => {
        tx.executeSql('DELETE FROM recipes WHERE id=?', [recipeId])
        tx.executeSql('DELETE FROM utensils WHERE recipe_id=?', [recipeId])
        tx.executeSql('DELETE FROM ingredients WHERE recipe_id=?', [recipeId])
        tx.executeSql('DELETE FROM instructions WHERE recipe_id=?', [recipeId])
    }, onError, onSuccess)
}