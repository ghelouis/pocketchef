import * as DocumentPicker from 'expo-document-picker';
import i18n from "i18n-js";
import {errorPopup, popup} from "./popups";
import * as FileSystem from "expo-file-system";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {saveRecipeToDB} from "./database";

/**
 * Manage importing a recipe from external storage
 */

export async function importRecipe(onImportRecipeSuccess) {
    const result = await DocumentPicker.getDocumentAsync()
    if (result.type === 'success') {
        const fileInCache = result.uri
        if (fileInCache.endsWith(".md")) {
            await importMd(fileInCache, onImportRecipeSuccess)
        } else if (fileInCache.endsWith(".zip")) {
            importZip(fileInCache)
        } else {
            errorPopup(i18n.t("errors.wrongDocType"))
        }
    }
}

async function importMd(fileInCache, onImportRecipeSuccess) {
    const md = await FileSystem.readAsStringAsync(fileInCache)
    console.log("md:")
    console.log(md)
    const recipe = recipeFromMarkdown(md)
    if (recipe.title === undefined) {
        errorPopup(i18n.t('parseFailure'))
    }
    recipe.id = uuidv4()
    console.log("recipe:")
    console.log(recipe)
    saveRecipeToDB(
        recipe.id,
        recipe.title,
        recipe.nbPerson,
        recipe.ingredients,
        recipe.instructions,
        recipe.utensils,
        recipe.notes,
        () => {
            onImportRecipeSuccess()
            popup(i18n.t('importSuccess'))
        },
        () => popup(i18n.t('errors.import')))
}

function importZip(fileInCache) {

}

function recipeFromMarkdown(md) {
    const lines = md.split("\n").filter(l => l !== "")
    const recipe = {
        title: undefined,
        nbPerson: 1,
        ingredients: [],
        instructions: [],
        utensils: [],
        notes: undefined
    }
    const currentBlock = {
        isIngredients: false,
        isInstructions: false,
        isUtensils: false,
        isNotes: false
    }
    recipe.title = trimLeadingSpaces(lines[0].substring(1, lines[0].length))
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (isNumberOfPeopleLine(line)) {
            recipe.nbPerson = extractNumberOfPeople(line)
        }
        if (line.startsWith('##')) {
            setCurrentBlock(currentBlock, line)
        } else if (currentBlock.isIngredients) {
            recipe.ingredients = [...recipe.ingredients, {step: recipe.ingredients.length, value: parseListItem(line)}]
        } else if (currentBlock.isInstructions) {
            recipe.instructions = [...recipe.instructions, {step: recipe.instructions.length, value: parseListItem(line)}]
        } else if (currentBlock.isUtensils) {
            recipe.utensils = [...recipe.utensils, {step: recipe.utensils.length, value: parseListItem(line)}]
        } else if (currentBlock.isNotes) {
            if (recipe.notes === undefined) {
                recipe.notes = line
            } else {
                recipe.notes += ('\n' + line)
            }
        }
    }
    return recipe
}

function setCurrentBlock(currentBlock, line) {
    currentBlock.isIngredients = false
    currentBlock.isInstructions = false
    currentBlock.isUtensils = false
    currentBlock.isNotes = false
    if (line === ('## ' + i18n.t('ingredients'))) {
        currentBlock.isIngredients = true
    } else if (line === ('## ' + i18n.t('instructions'))) {
        currentBlock.isInstructions = true
    } else if (line === ('## ' + i18n.t('utensils'))) {
        currentBlock.isUtensils = true
    } else if (line === ('## Notes')) {
        currentBlock.isNotes = true
    }
}

function trimLeadingSpaces(s) {
    var i = 0
    while (s[i] === " " && i < s.length) {
        i++
    }
    return s.substring(i, s.length)
}

function isNumberOfPeopleLine(line) {
    const forKeyWord = i18n.t('for')
    const personKeyWord = i18n.t('person')
    const peopleKeyWord = i18n.t('people')
    const words = line.split(" ")
    return words.length === 3 && words[0] === forKeyWord && (words[2] === personKeyWord || words[2] === peopleKeyWord)
}

function extractNumberOfPeople(line) {
    const nbPeople = line.split(" ")[1]
    if (!isNaN(nbPeople)) {
        return nbPeople
    } else {
        return 1
    }
}

function parseListItem(line) {
    return trimLeadingSpaces(line.substring(1, line.length))
}