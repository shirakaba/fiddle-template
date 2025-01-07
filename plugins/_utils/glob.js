/**
 * Sort the glob result alphabetically, to ensure results are identical across different devices (Linux/MacOS).
 * Since `glob@9` the results are determined by the OS and not guaranteed to be sorted.
 *
 * @param {Array<string>} glob
 *
 * @see https://github.com/isaacs/node-glob/issues/576#issuecomment-1972765500
 */
function withSortedGlobResult(glob) {
  return glob.sort((a, b) => a.localeCompare(b));
}

exports.withSortedGlobResult = withSortedGlobResult;
