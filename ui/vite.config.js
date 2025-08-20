import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import mkcert from 'vite-plugin-mkcert';
import * as path from 'path';
import * as fs from 'fs';
import { buildConfig } from './endpoints';
import oems from './oems.json';

const CURRENT_OEM_ENV = process.env.OEM_ENV || "opensource";
const OEM = oems[CURRENT_OEM_ENV];

console.log("OEM: ", JSON.stringify(OEM, null, 2));

const DEPLOY_ENV = process.env.DEPLOY_ENV;
const production = DEPLOY_ENV == 'production';

const projectRootDir = path.resolve(__dirname);
let apiHost;
let domain;

if (DEPLOY_ENV == 'development') {
    apiHost = "https://localhost:5001/api";
    domain = "https://localhost:5001";
} else if (DEPLOY_ENV == "production") {
    apiHost =  OEM?.hosts?.prod?.api || "https://app.your-domain.com/api";
    domain = OEM?.hosts?.prod?.frontend || "https://app.your-domain.com";
} else {
    throw new Error("DEPLOY ENVIRONMENT MUST BE SPECIFIED: ['development', 'production']");
}

const lines = fs.readFileSync('build.versions', 'utf-8').replaceAll("\r", "").split('\n').filter(Boolean);
const releaseNotesUI = fs.readFileSync('release_notes.txt', 'utf-8');

// UI VERSION
const d = new Date();
const versionUI = String(lines[lines.length-1].split(";")[0]).match(/v\d+.\d+.\d+/gm) 
					+ `-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;

// vX.Y.Z -> 0X00Y000Z | ex. v1.30.245 -> 010300245
const strVersion = String(lines[lines.length-1].split(";")[0]).match(/\d+.\d+.\d+/gm)[0].split(".");
const version = `${strVersion[0].padStart(2, '0')}${strVersion[1].padStart(3, '0')}${strVersion[2].padStart(4, '0')}`;


function setFileVersion(filename, ver){
    fs.readFile(filename, 'utf-8', function(err, data){
        if (err) throw err;
        var newValue = data.replace(/\?v=[0-9]*/gim, `?v=${ver}`);
        fs.writeFile(filename, newValue, 'utf-8', function (err) {
            if (err) throw err;
        });
    });

}

if (DEPLOY_ENV == "production" || DEPLOY_ENV == "staging") setFileVersion('index.html', version);
if (DEPLOY_ENV == "production" || DEPLOY_ENV == "staging") setFileVersion('public/offline.html', version);


let oemConfig = buildConfig({
    apiHost,
    domain,
    version,
    versionUI,
    releaseNotesUI,
    DEPLOY_ENV,
}, OEM);

export default defineConfig({
    resolve:{
        alias:{
            'utils': path.resolve(projectRootDir, 'src/utils'),
            'components': path.resolve(projectRootDir, 'src/components'),
            'store': path.resolve(projectRootDir, 'src/store'),
            'helpers': path.resolve(projectRootDir, '/static/assets/js/'),
            'routes': path.resolve(projectRootDir, 'src/routes'),
            'ui': path.resolve(projectRootDir, 'src/ui'),
        },
        dedupe: ['@fullcalendar/common'],
    },
    optimizeDeps: {
        include: ['@fullcalendar/common'],
    },
    build: {
        outDir: './dist/public',
        sourcemap: "hidden",
        rollupOptions: {
            treeshake: true,
            output: {
                assetFileNames: 'build-assets/[name]-[hash][extname]',
                chunkFileNames: 'build-assets/[name]-[hash].js',
                entryFileNames: 'build-assets/[name]-[hash].js',
                manualChunks: {
                    'canvas-confetti': ['canvas-confetti'],
                    'fullcalendar': ['@fullcalendar/common',
                        '@fullcalendar/core',
                        '@fullcalendar/daygrid',
                    ],
                    'phosphor-svelte': ['phosphor-svelte'],
                    'html5-qrcode': ['html5-qrcode'],
                    'svelte-qrcode': ['svelte-qrcode'],
                    'svelte-clipboard': ['svelte-clipboard'],
                    'svelte-dnd-action': ['svelte-dnd-action'],
                    'svelte-stripe': ['svelte-stripe'],
                    'svelte-i18n': ['svelte-i18n'],
                    'svelte-sortable-items': ['svelte-sortable-items'],
                    'svelte-spa-router': ['svelte-spa-router'],
                    'svelvet': ['svelvet'],
                    'svelte-filepond': ['svelte-filepond'],
                    'svelte-content-loader': ['svelte-content-loader'],
                    'svelte-sonner': ['svelte-sonner'],
                    'svelte-tiny-virtual-list': ['svelte-tiny-virtual-list'],
                    'svelte-select': ['svelte-select'],
                    'svelte-loading-spinners': ['svelte-loading-spinners'],
                    'svelte-star-rating': ['@ernane/svelte-star-rating'],
                    'tiptap': [
                        "@tiptap/core",
                        "@tiptap/extension-bubble-menu",
                        '@tiptap/extension-image',
                        '@tiptap/extension-task-list',
                        '@tiptap/extension-task-item',
                        '@tiptap/extension-text-align',
                        '@tiptap/extension-paragraph',
                        '@tiptap/extension-dropcursor',
                        '@tiptap/extension-underline',
                        '@tiptap/extension-table',
                        '@tiptap/extension-table-row',
                        '@tiptap/extension-table-cell',
                        '@tiptap/extension-table-header',
                        '@tiptap/extension-link',
                        '@tiptap/extension-mention',
                    ],
                    'scripts': [
                        'store/stores.js',
                        'utils/ApiMiddleware.js',
                        'utils/Functions.js',
                        'utils/Permissions.js',
                    ]
                }
            }
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5001,
        https: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000/',
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/ws': {
                target: 'ws://127.0.0.1:8000',
                ws: true,
            }
        }
    },
    define: oemConfig,
    plugins: [
        mkcert(),
        svelte({
        configFile: false,
        compilerOptions: {
            dev: !production,
            enableSourcemap: true,
        },
        hot: {
            preserveLocalState: true
        },
        preprocess: sveltePreprocess({
            typescript: true,
            postcss: true,
            sourceMap: true,
        }),
    })],
});
