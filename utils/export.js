import i18n from 'i18n-js';
import * as MediaLibrary from 'expo-media-library';
import {getCameraPermissions} from "./permissions";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {loadMainImages, mainImagesDir} from "./images";
//import { zip, unzip, unzipAssets, subscribe } from 'react-native-zip-archive'

const pocketChefExternalStorageMainDir = "PocketChef"

/**
 * Manage exporting a recipe to external storage
 */

export async function exportRecipe(recipe) {
    const images = await loadMainImages(recipe.id)
    if (images.length > 0) {
        await exportAsZip(recipe)
    } else {
        await exportAsFile(recipe)
    }
}

async function exportAsFile(recipe) {
    const md = recipeToMarkdown(recipe)
    const fileName = recipe.title + ".md"
    const tmpDir = FileSystem.cacheDirectory + '/recipe-' + recipe.id
    await FileSystem.makeDirectoryAsync(tmpDir, {intermediates: true})
    const tmpFile = tmpDir + '/' + fileName
    await FileSystem.writeAsStringAsync(tmpFile, md)
    const a = await Sharing.shareAsync(tmpFile)
    console.log(a)
}

async function exportAsZip(recipe) {
    const md = recipeToMarkdown(recipe)
    const fileName = recipe.title + ".md"
    const imagesDir = mainImagesDir(recipe.id)
    const tmpDir = FileSystem.cacheDirectory + '/recipe-' + recipe.id
    await FileSystem.makeDirectoryAsync(tmpDir, {intermediates: true})
    const tmpFile = tmpDir + '/' + fileName
    await FileSystem.writeAsStringAsync(tmpFile, md)
    await FileSystem.copyAsync({from: imagesDir, to: tmpDir + '/images'})
    // zip: removed - not working
    // const zipTarget = FS.cacheDirectory + '/' + recipe.title + ".zip"
    // instead export files directly (working)
    // dir (?) e.g file name like 'images/toto.jpg'?
    await Sharing.shareAsync(tmpDir)
}

export async function exportRecipeOld(recipe) {
    await getCameraPermissions()
    const images = await loadMainImages(recipe.id)
    const md = recipeToMarkdown(recipe)
    const fileName = recipe.title + ".md"
    const tmpDir = FileSystem.cacheDirectory + 'recipe-' + recipe.id
    await FileSystem.makeDirectoryAsync(tmpDir, {intermediates: true})
    const tmpFile = tmpDir + '/' + fileName
    await FileSystem.writeAsStringAsync(tmpFile, md)
    if (images.length === 0) {
        // No images. Create <Recipe Title>.md at the root
        return await createFileInExternalStorage(tmpFile, pocketChefExternalStorageMainDir)
    } else {
        // Some images. Create <Recipe Title> directory with <Recipe Title>.md and images directory
        const targetDir = pocketChefExternalStorageMainDir + "/" + recipe.title
        const imagesTargetDir = targetDir + '/images'
        await createFileInExternalStorage(tmpFile, targetDir)
        await Promise.all(images.map(image => {
            const imageFullPath = mainImagesDir(recipe.id) + '/' + image
            createFileInExternalStorage(imageFullPath, imagesTargetDir)
        }))
        return targetDir
    }
}

async function createFileInExternalStorage(file, targetDir) {
    const asset = await MediaLibrary.createAssetAsync(file)
    await MediaLibrary.createAlbumAsync(targetDir, asset, false)
    // asset.filename might differ from recipe.title,
    // e.g it will auto-increment to recipe.title_n.md if the file is already present
    return targetDir + '/' + asset.filename
}

function recipeToMarkdown(recipe) {
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
