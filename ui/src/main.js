// Initialize the Svelte app and inject it in the DOM
import App from './App.svelte';

import fetchIntercept from 'fetch-intercept';

fetchIntercept.register({
    request: function (url, config) {
        // Modify the url or config here
        return [url, config];
    },

    requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
    },

    response: function (response) {
        return response;
    },

    responseError: function (error) {
        // Handle an fetch error
        return Promise.reject(error);
    },
});

const replaceContainer = function (Component, options) {
    const frag = document.createDocumentFragment();
    const component = new Component(Object.assign({}, options, {target: frag}));

    options.target.replaceWith(frag);

    return component;
};

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    },
    enumerable: false,
});

const app = replaceContainer(App, {
    target: document.querySelector('#view'),
});

export default app;
