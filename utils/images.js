import * as FileSystem from 'expo-file-system';

/**
 * Manage Recipe images
 *
 * Structure:
 * PocketChef document directory
 * |-- recipes
 *      |
 *      | -- <recipe id>
 *             |
 *             | -- main
 *                   |
 *                   | -- photo1.jpg
 *                   | -- photo2.jpg
 *                   | -- ...
 */

export function createRecipesDir() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recipes', {intermediates: true}).then(() =>
        console.log("FS: directory " + FileSystem.documentDirectory + 'recipes' + " created successfully.")
    )
}

function baseName(uri) {
    const arr = uri.split("/")
    return arr[arr.length - 1]
}

export function mainImagesDir(recipeId) {
    return FileSystem.documentDirectory + 'recipes/' + recipeId + '/main'
}

// See https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

/**
* 1. Remove photos that were deleted (in dirContent but not in uris)
* 2. Copy over photos added (in uris but not in dirContent)
*/
export async function updateMainImages(recipeId, uris) {
    const dir = mainImagesDir(recipeId)
    const dirContent = await (FileSystem.readDirectoryAsync(dir))
    await asyncForEach(dirContent, async (item) => {
        if (!uris.includes(dir + '/' + item)) {
            await (FileSystem.deleteAsync(dir + '/' + item))
        }
    })
    await asyncForEach(uris, async (uri) => {
        if (!dirContent.includes(baseName(uri))) {
            await FileSystem.copyAsync({from: uri, to: dir + '/' + baseName(uri)})
        }
    })
}

export async function deleteAllImages(recipeId) {
    return FileSystem.deleteAsync(FileSystem.documentDirectory + 'recipes/' + recipeId)
}

export async function getAllImages() {
    const dirContent = await (FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'recipes/'))
    const promises = dirContent.map(item => {
        return FileSystem.readDirectoryAsync(mainImagesDir(item))
    })
    const images = await (Promise.all(promises))
    const recipeIdToImageMap = new Map()
    for (let i = 0; i < dirContent.length; i++) {
        recipeIdToImageMap.set(dirContent[i], mainImagesDir(dirContent[i]) + '/' + images[i][0])
    }
    return recipeIdToImageMap
}

export async function saveMainImages(recipeId, uris) {
    const dir = mainImagesDir(recipeId)
    await (FileSystem.makeDirectoryAsync(dir, {intermediates: true}))
    return await (Promise.all(uris.map(uri => saveMainImage(recipeId, uri.uri, dir))))
}

function saveMainImage(recipeId, uri, dir) {
    const targetUri = dir + '/' + baseName(uri)
    return FileSystem.copyAsync({from: uri, to: targetUri})
}

export function loadMainImages(recipeId) {
    return FileSystem.readDirectoryAsync(mainImagesDir(recipeId))
}

export async function loadMainImagesAsBase64(recipeId) {
    const imgsDir = mainImagesDir(recipeId)
    const images = (await (FileSystem.readDirectoryAsync(imgsDir))).map(name => ({name: name, data: undefined}))
    await asyncForEach(images, async (image) => {
        image.data = await(FileSystem.readAsStringAsync(imgsDir + "/" + image.name, {encoding: 'base64'}))
    })
    return images
}