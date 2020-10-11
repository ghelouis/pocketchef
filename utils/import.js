import i18n from 'i18n-js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {loadMainImagesAsBase64, mainImagesDir} from "./images";
import JSZip from "jszip";

/**
 * Manage importing a recipe from external storage
 */

export async function importRecipe() {
    // todo: file picker (.md or .zip file)
    recipeToMarkdown(md)
    // todo: handle returning error message if unable to parse
}

function recipeToMarkdown(md) {
    const lines = md.split("\n")
    const title = trimLeadingSpaces(lines[0].substring(1, lines[0].length))
}

function trimLeadingSpaces(s) {
    i = 0
    while (s[i] === " " && i < s.length) {
        i++
    }
    return s.substring(i, s.length)
}