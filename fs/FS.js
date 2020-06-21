import * as FileSystem from 'expo-file-system';

/**
 * Manage File System access
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
export default class FS {

    static baseName(uri) {
        const arr = uri.split("/")
        return arr[arr.length - 1]
    }

    static mainImagesDir(recipeId) {
        return FileSystem.documentDirectory + 'recipes/' + recipeId + '/main'
    }

    // See https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    /**
     * 1. Remove photos that were deleted (in dirContent but not in uris)
     * 2. Copy over photos added (in uris but not in dirContent)
     */
    static async updateMainImages(recipeId, uris) {
        const dir = FS.mainImagesDir(recipeId)
        const dirContent = await(FileSystem.readDirectoryAsync(dir))
        await FS.asyncForEach(dirContent, async (item) => {
            if (!uris.includes(dir + '/' + item)) {
                await (FileSystem.deleteAsync(dir + '/' + item))
            }
        })
        await FS.asyncForEach(uris, async (uri) => {
            if (!dirContent.includes(FS.baseName(uri))) {
                await FileSystem.copyAsync({from: uri, to: dir + '/' + FS.baseName(uri)})
            }
        })
    }

    static deleteAllImages(recipeId) {
        return FileSystem.deleteAsync(FileSystem.documentDirectory + 'recipes/' + recipeId)
    }

    static async saveMainImages(recipeId, uris) {
        const dir = FS.mainImagesDir(recipeId)
        await(FileSystem.makeDirectoryAsync(dir, {intermediates: true}))
        return await(Promise.all(uris.map(uri => FS.saveMainImage(recipeId, uri.uri, dir))))
    }

    static saveMainImage(recipeId, uri, dir) {
        const targetUri = dir + '/' + FS.baseName(uri)
        return FileSystem.copyAsync({from: uri, to: targetUri})
    }

    static loadMainImages(recipeId) {
        return FileSystem.readDirectoryAsync(FS.mainImagesDir(recipeId))
    }
}
