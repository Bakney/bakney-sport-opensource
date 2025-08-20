/**
 * Extracts the query parameters from the current URL.
 * This function is designed to work with hash-based routing.
 *
 * @returns {Object} An object containing the query parameters as key-value pairs.
 */
export function extractQueryFromLocation() {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');

    if (queryIndex === -1) {
        return {};
    }

    const queryString = hash.slice(queryIndex + 1);
    const queryParams = {};

    queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    return queryParams;
}
