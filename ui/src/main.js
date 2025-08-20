// Initialize the Svelte app and inject it in the DOM
import App from './App.svelte';

// import * as Sentry from '@sentry/svelte';
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
        // Modify the reponse object
        // if (response.status == 401) {
        //     alert('Unauthorized');
        // }
        // if (response.status == 401) localStorage.removeItem('expires');
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

// // Initialize the Sentry SDK here
// // if (__bakney.env.DEPLOY_ENV != 'development') {
// Sentry.init({
//     dsn: 'https://304c26db9ee4428fbbc10f8765e19f89@sentry.bakney.com/2',
//     integrations: [
//         Sentry.browserTracingIntegration(),
//         Sentry.replayIntegration({
//             // Additional SDK configuration goes in here, for example:
//             maskAllText: false,
//             blockAllMedia: false,
//         }),
//         // Sentry.replayCanvasIntegration(),
//     ],
//     environment: __bakney.env.DEPLOY_ENV,
//     // debug: true,

//     // Set tracesSampleRate to 1.0 to capture 100%
//     // of transactions for performance monitoring.
//     // We recommend adjusting this value in production
//     // once we reach a stable state.
//     // tracesSampleRate: _bakney.env.DEPLOY_ENV == 'production' ? 0.5 : 1.0,
//     tracesSampleRate: 1.0,

//     // This sets the sample rate to be 10%. You may want this to be 100% while
//     // in development and sample at a lower rate in production
//     // we keep 0.5 until with face stability
//     replaysSessionSampleRate: 0.5,
//     // If the entire session is not sampled, use the below sample rate to sample
//     // sessions when an error occurs.
//     replaysOnErrorSampleRate: 1.0,

//     // tracePropagationTargets: ["localhost", /^https:\/\/app\.bakney\.com/, /^https:\/\/app\.asdgymnia\.it/, /^https:\/\/app-staging\.bakney\.com/],
// });
// // }

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    },
    enumerable: false,
});

/*
const app = new App({
    target: document.querySelector('#view')
})
*/

// const renderSplashScreenBefore = async () => {
//     await SplashScreen.show({
//         showDuration: 1500,
//         autoHide: true,
//     });
//     return replaceContainer(App, {
//         target: document.querySelector('#view')
//     });
// }
const app = replaceContainer(App, {
    target: document.querySelector('#view'),
});

export default app;
