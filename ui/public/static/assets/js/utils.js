// utils
function _calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.addDays(1).getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function capitalizeWords(string) {
    return string.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}


/*
An associate data has 2 params: isMinor and bornDate
the first is a boolean (is minor or not) and the second a string (born date)
(REQUIRES jQuery)
*/
function updateIsMinor(newAssociate, inputDataValueId, DEBUG) {
    // to be fixed i guess
    newAssociate.associate_data.born_date = document.getElementById(inputDataValueId).value;

    // [dd, mm, yyyy]
    let dateParts = newAssociate.associate_data.born_date.split('/');
    // new Date requires mm/dd/yyyy
    let dateFormatted = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2]

    if (_calculateAge(new Date(dateFormatted)) < 18)
        newAssociate.associate_data.is_minor = true;
    else
        newAssociate.associate_data.is_minor = false;

    if (DEBUG)
        console.log('onInputBornDate', _calculateAge(new Date(dateFormatted)), newAssociate.associate_data.born_date, newAssociate.associate_data.is_minor);

    return newAssociate;
}

/*
Base64 converters utils
*/
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

 const getBase64 = function(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    return reader;
};

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }


 // Download pdf document
 function downloadPdf(url) {
    token = localStorage.getItem('sessionToken').replaceAll('"', '');
    window.open(url+'?download=true&token='+token, '_blank');
}

function downloadCSV(filename, base64) {
    var a = document.createElement("a"); //Create <a>
    a.href = "data:text/csv;base64," + base64; //Image Base64 Goes here
    a.download = filename; //File name Here
    a.click(); //Downloaded file
    a.remove();
}

function downloadFile(filename, base64, filetype='text/csv') {
    var a = document.createElement("a"); //Create <a>
    a.href = `data:${filetype};base64,${base64}`; //Image Base64 Goes here
    a.download = filename; //File name Here
    a.click(); //Downloaded file
    a.remove();
}

function downloadZip(filename, base64) {
    alert(base64);
    var a = document.createElement("a"); //Create <a>
    a.href = `data:application/zip;base64,${base64}`; //Image Base64 Goes here
    a.download = filename; //File name Here
    a.click(); //Downloaded file
    a.remove();
}
