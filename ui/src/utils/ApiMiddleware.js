import {sessionToken} from '../store/stores';
import {get} from 'svelte/store';

sessionToken.useLocalStorage();

//sessionToken.useLocalStorage();
export const ApiMiddlewareUrls = {
    login: __bakney.env.HOST + '/oauth2/login',
    signup: __bakney.env.HOST + '/oauth2/login',
    reset: __bakney.env.HOST + '/oauth2/reset',
    // eslint-disable-next-line no-dupe-keys
    login: __bakney.env.HOST + '/oauth2/login',
    // eslint-disable-next-line no-dupe-keys
    login: __bakney.env.HOST + '/oauth2/login',
    // eslint-disable-next-line no-dupe-keys
    login: __bakney.env.HOST + '/oauth2/login',
};

export const updateTableSettings = function (cols, table) {
    let settings = localStorage.getItem('tablesSettings');
    if (settings) settings = JSON.parse(settings);
    else settings = {};

    settings[table] = cols;
    // if table is not set, set it
    // if (!settings[table]) settings[table] = {};
    // settings[table] = cols;
    localStorage.setItem('tablesSettings', JSON.stringify(settings));

    // call apiFetch to update settings
    apiFetch(__bakney.env.API.PROFILE.TABLES, {
        method: 'POST',
        body: JSON.stringify({tables_settings: settings}),
    });
};

// override fetch to execute operations before and after
// Store the original fetch function in a variable
export const originalFetch = window.fetch;

// function to check if token is expired
let checkExpired = async function () {
    let sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
    let refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
    let expires = localStorage.getItem('expires');
    if (sessionToken && refreshToken && expires) {
        if (Date.now() > expires) {
            // updating headers
            let headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${sessionToken}`,
            };
            let res = await originalFetch(__bakney.env.API.OAUTH2.REFRESH_TOKEN, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    refresh_token: refreshToken,
                }),
            });
            let response = await res.json();
            if (res.status == 200 && response.access_token && response.refresh_token && response.expires_in) {
                localStorage.setItem('sessionToken', `"${response?.access_token}"`);
                localStorage.setItem('refreshToken', `"${response?.refresh_token}"`);
                localStorage.setItem('expires', Date.now() + parseInt(response.expires_in) * 1000);
                return {
                    sessionToken: response.access_token,
                    refreshToken: response.refresh_token,
                    expires: Date.now() + parseInt(response.expires_in) * 1000,
                };
            }
            if (response?.error && response?.error == 'invalid_grant') {
                localStorage.clear();
                window.location.reload();
            }
        }
        return {sessionToken: sessionToken, refreshToken: refreshToken, expires: expires};
    }
    return {sessionToken: null, refreshToken: null, expires: null};
};

// Override the fetch function with your custom function
window.fetch = async (...args) => {
    // skip for fetch on urls different from same origin (api)
    if (!args[0]?.url?.includes('/api')) return await originalFetch(...args);

    // Operations before the fetch call
    let {sessionToken, refreshToken, expires} = await checkExpired();
    if (sessionToken && refreshToken && expires) {
        if (!args[1]) args[1] = {};
        // check if headers are set
        args[1]['headers'] = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
        };
    }

    if (localStorage.getItem('switched_superuser') == 'true' && localStorage.getItem('USER_ID') != null) {
        let USER_ID = localStorage.getItem('USER_ID');
        console.info('USER_fdID', USER_ID);
        console.info('args', args);
        // check if headers are set and arg 1 is present
        if (!args[1]) args[1] = {};
        args[1]['headers'] = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
            'User-Id': USER_ID,
        };
    }

    // get selectedGroup from localStorage
    let selectedGroup = localStorage.getItem('selectedGroup');
    if (selectedGroup && JSON.parse(selectedGroup) != null) args[1]['headers']['X-Group-ID'] = JSON.parse(selectedGroup);

    try {
        // Execute the original fetch function
        const response = await originalFetch(...args);

        // Operations after the response is received

        // Return the response object
        return response;
    } catch (error) {
        // Handle any errors
        console.error('Fetch error:', error);
        throw error;
    }
};

// override XHR to execute operations before and after
(function (originalXHR) {
    // Replace the original XMLHttpRequest with the custom one
    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();

        // Store the original open and send methods
        const originalOpen = xhr.open;
        const originalSend = xhr.send;

        // Variables to store method and URL which will be available in the send override
        let method, url;

        // Override the open method
        xhr.open = function (m, u, async, user, password) {
            method = m;
            url = u;
            originalOpen.apply(xhr, arguments);
        };

        // Override the send method
        xhr.send = async function (data) {
            // Only intercept for same origin (api) requests
            if (!url?.includes('/api')) {
                originalSend.call(xhr, data);
                return;
            }

            let USER_ID = null;
            if (localStorage.getItem('switched_superuser') == 'true' && localStorage.getItem('USER_ID') != null) {
                USER_ID = localStorage.getItem('USER_ID');
            }
            if (USER_ID) xhr.setRequestHeader('User-Id', USER_ID);

            // get selectedGroup from localStorage
            let selectedGroup = localStorage.getItem('selectedGroup');
            if (selectedGroup && JSON.parse(selectedGroup) != null) xhr.setRequestHeader('X-Group-ID', JSON.parse(selectedGroup));

            // Attach event listeners to handle the response
            xhr.addEventListener('load', function () {
                // Operations after the response is received
                // You can work with `xhr.response` here if needed
            });

            xhr.addEventListener('error', function () {
                // Handle any errors
                console.error('XHR error:', xhr.statusText);
            });

            // Execute the original send method
            originalSend.call(xhr, data);
        };

        return xhr;
    };
})(XMLHttpRequest);

export const apiFetch = async function (url, fetchData = {method: 'GET'}) {
    let sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
    // updating headers
    let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    // get selectedGroup from localStorage
    let selectedGroup = localStorage.getItem('selectedGroup');
    if (selectedGroup && JSON.parse(selectedGroup) != null) headers['X-Group-ID'] = JSON.parse(selectedGroup);

    fetchData['headers'] = headers;

    const response = await window.fetch(url, fetchData);
    let error = false;
    let jsonResponse = {};

    if (response.status == 200 || response.status == 201) {
        jsonResponse = await response.json();
    } else if (response.status == 401) {
        error = true;
        if (localStorage.getItem('sessionToken') && !fetchData.skipForbidden) {
            localStorage.clear();
            window.location.reload();
        }
    } else if (response.status == 500) {
        error = true;
        jsonResponse = {message: 'Errore interno'};
    } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            jsonResponse = await response.json();
        } else {
            jsonResponse = await response.text();
        }
        error = true;
    }

    return {response: jsonResponse, error: error, status: response.status};
};

export const replaceUID = function (url, UID, placeholder = '<uid>') {
    return url.replaceAll(placeholder, UID);
};
