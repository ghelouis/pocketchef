import i18n from 'i18n-js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {loadMainImagesAsBase64, mainImagesDir} from "./images";
import JSZip from "jszip";

/**
 * Manage exporting a recipe to external storage
 *
 * - if the recipe has no images: single markdown file <Recipe title>.md
 * - if the recipe has images: zip file:
 *     <Recipe title>.zip
 *      |-- <Recipe title>.md
 *      |-- images
 *           |-- <image 1>
 *           |-- <image 2>
 *           |-- ...
 */

export async function exportRecipe(recipe) {
    const images = await loadMainImagesAsBase64(recipe.id)
    if (images.length > 0) {
        await exportAsZip(recipe, images)
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
    await Sharing.shareAsync(tmpFile)
}

async function exportAsZip(recipe, images) {
    const md = recipeToMarkdown(recipe)
    const fileName = recipe.title + ".md"
    const imagesDir = mainImagesDir(recipe.id)
    const tmpDir = FileSystem.cacheDirectory + '/recipe-' + recipe.id
    await FileSystem.makeDirectoryAsync(tmpDir, {intermediates: true})
    const tmpFile = tmpDir + '/' + fileName
    await FileSystem.writeAsStringAsync(tmpFile, md)
    await FileSystem.copyAsync({from: imagesDir, to: tmpDir + '/images'})
    const zipTarget = FileSystem.cacheDirectory + '/' + recipe.title + ".zip"
    const jszip = new JSZip()
    jszip.file(fileName, md)
    const imgZip = jszip.folder("images")
    images.map(image => imgZip.file(image.name, image.data, {base64: true}))
    await jszip.generateAsync({type:"base64"}).then(function(content) {
        FileSystem.writeAsStringAsync(zipTarget, content, {
            encoding: FileSystem.EncodingType.Base64
        })
    })
    await Sharing.shareAsync(zipTarget)
}

function recipeToMarkdown(recipe) {
    var md = `# ${recipe.title}\n`
    md += `${i18n.t('for')} ${recipe.nbPerson} ${recipe.nbPerson === 1 ? i18n.t('person') : i18n.t('people')}\n`
    if (recipe.ingredients.length > 0) {
        md += `\n## ${i18n.t('ingredients')}\n${getListMd(recipe.ingredients)}\n`
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

function getListMd(list) {
    return `${list.map(i => '-' + ' ' + i.value).join('\n')}`
}
