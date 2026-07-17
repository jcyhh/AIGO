export function isThirdPartySource(filePath = '') {
    const normalizedPath = filePath.replaceAll('\\', '/')

    return normalizedPath.includes('/node_modules/')
        || normalizedPath.includes('/src/vendor/')
        || normalizedPath.includes('/src/third-party/')
        || normalizedPath.startsWith('node_modules/')
        || normalizedPath.startsWith('src/vendor/')
        || normalizedPath.startsWith('src/third-party/')
}
