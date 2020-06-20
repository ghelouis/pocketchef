import * as FileSystem from 'expo-file-system';

/**
 * Manage File System access
 */
export default class FS {

    static mainImagesDir(recipeId) {
        return FileSystem.documentDirectory + 'recipes/' + recipeId + '/main'
    }

    static async saveMainImages(recipeId, uris) {
        const dir = this.mainImagesDir(recipeId)
        await(FileSystem.makeDirectoryAsync(dir, {intermediates: true}))
        return await(Promise.all(uris.map(uri => FS.saveMainImage(recipeId, uri.uri, dir))))
    }

    static saveMainImage(recipeId, uri, dir) {
        const arr = uri.split("/")
        const targetUri = dir + '/' + arr[arr.length - 1]
        return FileSystem.copyAsync({from: uri, to: targetUri})
    }

    static loadMainImages(recipeId) {
        return FileSystem.readDirectoryAsync(FS.mainImagesDir(recipeId))
    }
}
