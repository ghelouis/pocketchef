import i18n from 'i18n-js';
import * as MediaLibrary from 'expo-media-library';
import {getCameraPermissions} from "./permissions";
import * as FileSystem from 'expo-file-system';
import FS from "../fs/FS";

const pocketChefExternalStorageMainDir = "PocketChef"

/**
 * Manage exporting a recipe to external storage
 *
 * Currently using a hack to create a file on external storage via MediaLibrary,
 * waiting for expo to properly implement this.
 * See https://expo.canny.io/feature-requests/p/ability-to-save-files-on-internal-storage
 *
 * Exporting a recipe creates the following directory structure at the root of the device:
 * PocketChef
 * |-- <Recipe Title> // if the recipe has images
 *     |-- <Recipe Title>.md
 *     |-- Images
 *         |-- <img1>.jpg
 *         |-- <img2>.jpg
 *         |-- ...
 * |-- <Recipe Title>.md // if the recipe has no images
 *
 * By default (on Android at least) a new file with a trailing _n is created if a file
 * with the same name already exists.
 * As deletion doesn't work well with MediaLibrary we keep it as is for now.
 */

export async function exportRecipe(recipe) {
    await getCameraPermissions()
    const images = await FS.loadMainImages(recipe.id)
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
            const imageFullPath = FS.mainImagesDir(recipe.id) + '/' + image
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
