import i18n from 'i18n-js';
import * as MediaLibrary from 'expo-media-library';
import {getCameraPermissions} from "./permissions";
import * as FileSystem from 'expo-file-system';

const pocketChefExternalStorageMainDir = "PocketChef"

// hack to create a file on external storage via MediaLibrary
// waiting for expo to properly implement this,
// see https://expo.canny.io/feature-requests/p/ability-to-save-files-on-internal-storage
export async function exportRecipe(recipe) {
    await getCameraPermissions()
    const md = recipeToMarkdown(recipe)
    const fileName = recipe.title + ".md"
    const tmpDir = FileSystem.cacheDirectory + 'recipe-' + recipe.id
    await FileSystem.makeDirectoryAsync(tmpDir, {intermediates: true})
    await FileSystem.writeAsStringAsync(tmpDir + '/' + fileName, md)
    const asset = await MediaLibrary.createAssetAsync(tmpDir + '/' + fileName)
    await MediaLibrary.createAlbumAsync(pocketChefExternalStorageMainDir, asset)
    console.log("f")
    return pocketChefExternalStorageMainDir + "/" + asset.filename
}

function recipeToMarkdown(recipe) {
    console.log(recipe)
    var md = `# ${recipe.title}\n`
    md += `${i18n.t('for')} ${recipe.nbPerson} ${recipe.nbPerson === 1 ? i18n.t('person') : i18n.t('people')}\n`
    if (recipe.ingredients.length > 0) {
        md += `\n${getIngredientsMd(recipe.ingredients)}\n`
    }
    if (recipe.instructions.length > 0) {
        md += `\n## ${i18n.t('instructions')}\n${getListMd(recipe.instructions)}\n`
    }
    if (recipe.utensils.length > 0) {
        md += `\n## ${i18n.t('utensils')}\n${getListMd(recipe.utensils)}\n`
    }
    if (recipe.notes) {
        md += `\n## Notes\n${recipe.notes}`
    }
    return md
}

function getIngredientsMd(ingredients) {
    var md = `## ${i18n.t('ingredients')}\n`
    md += `${ingredients.map(i => getIngredientRow(i)).join('\n')}`
    return md
}

function getIngredientRow(ingredient) {
    const quantity = ingredient.quantity ? ingredient.quantity + ' ' : ''
    const unit = ingredient.unit ? ingredient.unit + ' ' : ''
    const value = ingredient.value ? ingredient.value : ''
    return '-' + ' ' + quantity + unit + value
}

function getListMd(list) {
    return `${list.map(i => '-' + ' ' + i.value).join('\n')}`
}

function getNotesMd(notes) {
    if (notes) {
        return `
        ## Notes
        ${notes}`
    }
    return ''
}