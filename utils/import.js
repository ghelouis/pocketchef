import * as DocumentPicker from 'expo-document-picker';
import i18n from "i18n-js";
import {errorPopup, popup} from "./popups";
import * as FileSystem from "expo-file-system";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import {saveRecipeToDB} from "./database";
import JSZip from "jszip";
import {saveMainImages, saveRawMainImage} from "./images";

/**
 * Manage importing a recipe from external storage
 *
 * Mirror of export.js > exportRecipe
 * Can import a single markdown file or a zip archive
 */

export async function importRecipe(onImportRecipeSuccess) {
    const result = await DocumentPicker.getDocumentAsync()
    if (result.type === 'success') {
        const fileInCache = result.uri
        const recipeId = uuidv4()
        if (fileInCache.endsWith(".md")) {
            const md = await FileSystem.readAsStringAsync(fileInCache)
            await importMd(md, recipeId, onImportRecipeSuccess)
        } else if (fileInCache.endsWith(".zip")) {
            await importZip(fileInCache, result.name, recipeId, onImportRecipeSuccess)
        } else {
            errorPopup(i18n.t("errors.wrongDocType"))
        }
    }
}

async function importMd(md, recipeId, onImportRecipeSuccess) {
    const recipe = recipeFromMarkdown(md)
    if (recipe.title === undefined) {
        errorPopup(i18n.t('parseFailure'))
    }
    await saveMainImages(recipeId, [])
    saveRecipeToDB(
        recipeId,
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

async function importZip(fileInCache, name, recipeId, onImportRecipeSuccess) {
    const mdFile = name.replace(".zip", ".md")
    const jszip = new JSZip()
    const fileBase64 = await FileSystem.readAsStringAsync(fileInCache, {
        encoding: FileSystem.EncodingType.Base64
    })
    jszip.loadAsync(fileBase64, {base64: true}).then(function (zip) {
        Object.keys(zip.files).forEach((filename) => {
            if (filename.startsWith("images/") && filename !== "images/") {
                zip.files[filename].async('base64').then((imgData) => {
                    saveRawMainImage(recipeId, filename, imgData)
                })
            }
        })
        zip.file(mdFile).async("string").then((md) => {
            importMd(md, recipeId, onImportRecipeSuccess)
        })
    })
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