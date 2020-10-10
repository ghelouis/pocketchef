
/**
 * Manage multiplying the quantity of an ingredient dynamically
 */

/**
 * Multiply the quantity of a given ingredient.
 * Supported use-cases:
 * - '3 apples'
 * - '4.2 grams'
 * - '4,2 grams'
 * - '5ml'
 * @param ingredient, the current ingredient row, e.g '3 teaspoons of sugar'
 * @param ratio, the new ratio, e.g '3'
 * return ingredient with the updated quantity (or the same if no quantity was detected)
 */
export function multiplyIngredient(ingredient, ratio) {
    const words = ingredient.split(" ")
    const firstWord = words[0]
    const ending = words.length > 1 ? " " + words.splice(1).join(" ") : ""
    var replacedDecimalSeparator = false
    var newQty = 1
    if (firstWord.includes(",")) {
        const decimal = firstWord.replace(",", ".")
        newQty = decimal * ratio
        replacedDecimalSeparator = true
    } else {
        newQty = firstWord * ratio
    }
    if (!isNaN(newQty)) {
        if (replacedDecimalSeparator) {
            newQty = String(Number(newQty.toFixed(2))).replace(".", ",")
        } else {
            newQty = Number(newQty.toFixed(2))
        }
        return newQty + ending
    }
    var len = firstWord.length - 1
    while (len >= 0) {
        if (multiplyIngredient(firstWord.substring(0, len), ratio) !== ingredient) {
            break
        }
        len -= 1
    }
    if (len !== 0) {
        return multiplyIngredient(firstWord.substring(0, len), ratio) + firstWord.substring(len, firstWord.length) + ending
    }
    return ingredient
}