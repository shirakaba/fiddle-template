// https://github.com/expo/expo/blob/sdk-52/packages/%40expo/config-plugins/src/utils/sortObject.ts

/**
 * @param {T extends Record<string, any>} obj
 * @param {(a: string, b: string) => number} [compareFn]
 * @returns {T}
 */
function sortObject(obj, compareFn) {
  return Object.keys(obj)
    .sort(compareFn)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: obj[key],
      }),
      {},
    );
}

exports.sortObject = sortObject;
