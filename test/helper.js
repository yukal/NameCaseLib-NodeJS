'use strict';

const fs = require('node:fs');
const path = require('node:path');

function getType(obj) {
    const signature = Object.prototype.toString.call(obj);
    return signature.slice(8, -1).toLowerCase();
}

function loadData(gender, biggest_part = 'f') {
    const stubFilesDir = path.join(process.cwd(), 'data/uacrazy');

    const parts = {};
    const delimeter = ',';

    switch (gender) {
        case 'masculine':
            gender = 'boy';
            break;

        case 'feminine':
            gender = 'girl';
            break;
    }

    const files = {
        f: path.join(stubFilesDir, `Sirnames${gender}.txt`),
        i: path.join(stubFilesDir, `Names${gender}.txt`),
        o: path.join(stubFilesDir, `Father${gender}.txt`),
    };

    for (let key in files) {
        const rows = fs.readFileSync(files[key], 'utf8')
            .trim()
            .split('\n');

        parts[key] = [];

        for (let row of rows) {
            if (!row.length) {
                continue;
            }

            let forms = row.split(delimeter);
            if (forms.length < 6) {
                continue;
            }

            parts[key].push(forms);
        }

        if (parts[key].length > parts[biggest_part].length) {
            biggest_part = key;
        }
    }

    return parts;
}

function getMergedCases(itemNumber = 0, data = {}) {
    const parts = {};
    const cases = [];

    let min_forms = 0;

    for (let key in data) {
        const item = data[key];
        const num = itemNumber % item.length;

        parts[key] = item[num];

        if (min_forms == 0 || parts[key].length < min_forms) {
            min_forms = parts[key].length;
        }
    }

    for (let f = 0; f < min_forms; f++) {
        let fio = parts.f[f] + ' ' + parts.i[f] + ' ' + parts.o[f];
        cases.push(fio);
    }

    return cases;
}

module['exports'] = Object.freeze({
    getType,

    loadData,
    getMergedCases,
});
