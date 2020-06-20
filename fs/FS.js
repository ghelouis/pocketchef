import * as FileSystem from 'expo-file-system';

/**
 * Manage File System access
 */
export default class FS {

    static async saveMainImages(recipeId, uris) {
        const dir = FileSystem.documentDirectory + 'recipes/' + recipeId + '/main'
        await(FileSystem.makeDirectoryAsync(dir, {intermediates: true}))
        return await(Promise.all(uris.map(uri => FS.saveMainImage(recipeId, uri.uri, dir))))
    }

    static saveMainImage(recipeId, uri, dir) {
        const arr = uri.split("/")
        const targetUri = dir + '/' + arr[arr.length - 1]
        return FileSystem.copyAsync({from: uri, to: targetUri})
    }
}
