import {apiFetch} from './ApiMiddleware';

export const getAthletesEmails = async function () {
    let res = await apiFetch(__bakney.env.HOST + '/subscription/list?field=email');
    // set emails in the input
    document.getElementById('email-textarea').value = res?.response.data?.map(athlete => athlete).join(',');
};

export const getAthletesPhones = async function () {
    let res = await apiFetch(__bakney.env.HOST + '/subscription/list?field=phone');
    // set emails in the input
    document.getElementById('phone-textarea').value = res?.response.data?.map(athlete => athlete).join(',');
};

/**
 * Function to collapse sidebar
 * @returns void
 */
export const collapseSidebar = () => document.getElementById('kt_aside_mobile_toggle')?.click();

/**
 * extract base64 from image url
 * @param {*} url
 * @returns base64
 */
export const getBase64FromUrl = async url => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        };
    });
};

export const toBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

export const toBase64Safe = function (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const EURcurrency = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
});

export const fixedDecimal = n => {
    let parsed = parseFloat(n || 0)
        .toFixed(2)
        .replace('.', ',');
    // add . every 3 digits for thousands
    parsed = parsed.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return parsed;
};

export const getDataFromForm = e => {
    const formData = new FormData(e.target);

    const data = {};
    for (let field of formData) {
        const [key, value] = field;
        if (value instanceof File) {
            if (data[key]) {
                // If multiple files allowed, add to array
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                // First file, create array if multiple files allowed
                data[key] = value.multiple ? [value] : value;
            }
        } else if (data[key]) {
            data[key] = data[key] + ',' + value;
        } else {
            data[key] = value;
        }
    }
    return data;
};

export const waitForElementAndExecute = function (id, callback) {
    return new Promise(resolve => {
        function checkElement() {
            const element = document.querySelector(id);
            if (element) {
                resolve(element);
            } else {
                requestAnimationFrame(checkElement);
            }
        }
        checkElement();
    }).then(element => {
        callback(element);
    });
};

export const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        const context = this,
            args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

export const clearLocalStorageForPartialMatching = key_match => {
    for (let key in localStorage) {
        if (key.includes(key_match)) {
            localStorage.removeItem(key);
        }
    }
};

export const getObjectHash = obj => {
    return JSON.stringify(obj);
};

export const compareObjects = (obj1, obj2) => {
    const differences = {};

    const compare = (item1, item2, path = '') => {
        if (typeof item1 !== typeof item2) {
            differences[path] = {
                oldValue: item1,
                newValue: item2,
                type: 'type_change',
            };
            return;
        }

        if (typeof item1 !== 'object' || item1 === null || item2 === null) {
            if (item1 !== item2) {
                differences[path] = {
                    oldValue: item1,
                    newValue: item2,
                    type: 'value_change',
                };
            }
            return;
        }

        const keys = new Set([...Object.keys(item1), ...Object.keys(item2)]);

        for (const key of keys) {
            const newPath = path ? `${path}.${key}` : key;

            if (!(key in item1)) {
                differences[newPath] = {
                    newValue: item2[key],
                    type: 'added',
                };
            } else if (!(key in item2)) {
                differences[newPath] = {
                    oldValue: item1[key],
                    type: 'removed',
                };
            } else {
                compare(item1[key], item2[key], newPath);
            }
        }
    };

    compare(obj1, obj2);

    const formatDifferences = () => {
        let output = '';
        for (const [path, diff] of Object.entries(differences)) {
            output += `\n${path}:\n`;
            switch (diff.type) {
                case 'type_change':
                    output += `  - Type changed from ${typeof diff.oldValue} to ${typeof diff.newValue}\n`;
                    output += `  - Old value: ${JSON.stringify(diff.oldValue)}\n`;
                    output += `  - New value: ${JSON.stringify(diff.newValue)}\n`;
                    break;
                case 'value_change':
                    output += `  - Value changed\n`;
                    output += `  - Old value: ${JSON.stringify(diff.oldValue)}\n`;
                    output += `  - New value: ${JSON.stringify(diff.newValue)}\n`;
                    break;
                case 'added':
                    output += `  - Property added\n`;
                    output += `  - New value: ${JSON.stringify(diff.newValue)}\n`;
                    break;
                case 'removed':
                    output += `  - Property removed\n`;
                    output += `  - Old value: ${JSON.stringify(diff.oldValue)}\n`;
                    break;
            }
        }
        return output;
    };

    return formatDifferences();
};


export const updateIsMinor = (newAssociate, inputDataValueId, DEBUG) => {
    // to be fixed i guess
    newAssociate.associate_data.born_date = document.getElementById(inputDataValueId).value;

    // [dd, mm, yyyy]
    let dateParts = newAssociate.associate_data.born_date.split('/');
    // new Date requires mm/dd/yyyy
    let dateFormatted = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2];

    if (_calculateAge(new Date(dateFormatted)) < 18)
        newAssociate.associate_data.is_minor = true;
    else
        newAssociate.associate_data.is_minor = false;

    if (DEBUG)
        console.log('onInputBornDate', _calculateAge(new Date(dateFormatted)), newAssociate.associate_data.born_date, newAssociate.associate_data.is_minor);

    return newAssociate;
};

export const showSection = function (type, settings, section_type=null) {
    if (section_type == 'additional_sections') {
        if (settings.show_to_members && type == 1) return true;
        if (settings.show_to_both && (type == 2)) return true;
        if (settings.show_to_athletes && type == 3) return true;
    } else if (section_type == 'regulation') {
        if (settings.show_regulation_to_members && type == 1) return true;
        if (settings.show_regulation_to_both && (type == 2)) return true;
        if (settings.show_regulation_to_athletes && type == 3) return true;
    } else if (section_type == 'demand') {
        if (settings.show_demand_to_members && type == 1) return true;
        if (settings.show_demand_to_both && (type == 2)) return true;
        if (settings.show_demand_to_athletes && type == 3) return true;
    }
    return false;
};