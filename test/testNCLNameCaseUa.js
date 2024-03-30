'use strict';

// Use nodeJS native test modules, see:
// 
// https://nodejs.org/api/test.html
// https://nodejs.org/api/assert.html
// 
// node@16: node --test ./test
// node@18: node --test --experimental-test-coverage ./test
//          node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info

const assert = require('node:assert');
const { describe, it, test } = require('node:test');


const NCLNameCaseUa = require('../src/NCLNameCaseUa');
const NCL = require('../src/NCL/NCL');

describe('NCLNameCaseUa', () => {
    const consonants = 'бвгджзйклмнпрстфхцчшщ';
    const vowels = 'аеиоуіїєюя';
    const apostrophe = '’';

    const ncl = new NCLNameCaseUa();

    it(`inverseGKH(): replacement [гкх] —» [зцс]`, () => {
        const cases = [
            { in: 'г', out: 'з' },
            { in: 'к', out: 'ц' },
            { in: 'х', out: 'с' },
        ];

        for (let item of cases) {
            assert.strictEqual(ncl.inverseGKH(item.in), item.out);
        }
    });

    it(`inverse2(): replacement [гкх] —» [жчш]`, () => {
        const cases = [
            { in: 'г', out: 'ж' },
            { in: 'к', out: 'ч' },
            { in: 'х', out: 'ш' },
        ];

        for (let item of cases) {
            assert.strictEqual(ncl.inverse2(item.in), item.out);
        }
    });

    it(`isApostrof()`, () => {
        const cases = [
            {
                chars: ' ' + consonants + vowels,
                result: false,
            },
            {
                chars: 'ґь',
                result: true,
            },
        ];

        for (let item of cases) {
            for (let n = 0, len = item.chars.length; n < len; n++) {
                assert.strictEqual(
                    ncl.isApostrof(item.chars[n]),
                    item.result,
                );
            }
        }
    });

    it(`detect2Group()`, () => {
        ncl.fullReset();

        const cases = {
            1: [
                'береза',
                'дорога',
                'Дніпро',
                'шлях',
                'віз',
                'село',
                'яблуко',
            ],
            2: [
                'пожежа',
                'пуща',
                'тиша',
                'алича',
                'вуж',
                'кущ',
                'плющ',
                'ключ',
                'плече',
                'прізвище',
            ],
            3: [
                'земля',
                'зоря',
                'армія',
                'сім’я',
                'серпень',
                'фахівець',
                'трамвай',
                'сузір’я',
                'насіння',
                'узвишшя',
            ],
        };

        for (let group in cases) {
            for (let word of cases[group]) {
                const result = ncl.detect2Group(word);
                assert.strictEqual(result, Number.parseInt(group, 10));
            }
        }
    });

    it(`FirstLastVowel()`, () => {
        ncl.fullReset();

        const words = [
            'береза',
            'море',
            'мати',
            'яблуко',
            'любчику',
            'досі',
            'моєї',
            'накрапає',
            'кицю',
            'пісня',
        ];

        for (let word of words) {
            const expect = word.slice(-1);
            const result = ncl.FirstLastVowel(word, vowels);

            assert.strictEqual(result, expect);
        }

        for (let word of words) {
            const expect = word.slice(-1);
            const result = ncl.FirstLastVowel(word, consonants);

            assert.notEqual(result, expect, `${word} => Expect( ${expect} ); Got( ${result} )`);
        }
    });

    it('getOsnova', () => {
        ncl.fullReset();

        const cases = {
            in: 'батечку матінко цілую ваші руки'.split(' '),
            out: 'батечк матінк ціл ваш рук'.split(' '),
        };

        cases.in.forEach((word, idx) => {
            const result = ncl.getOsnova(word);
            assert.strictEqual(result, cases.out[idx]);
        });
    });

    it('getFormatted()', () => {
        const expect = [
            'Тарас Григорович Шевченко',
            'Тараса Григоровича Шевченка',
            'Тарасові Григоровичу Шевченкові',
            'Тараса Григоровича Шевченка',
            'Тарасом Григоровичем Шевченком',
            'Тарасові Григоровичу Шевченкові',
            'Тарасе Григоровичу Шевченче'
        ];

        ncl.fullReset();
        ncl.setFullName('Шевченко', 'Тарас', 'Григорович');

        const result = ncl.getFormatted(-1, 'N F S');

        assert.strictEqual(
            result.join(','),
            expect.join(','),
        );
    });

    it(`qFullName()`, () => {
        const expect = [
            'Шевченко Тарас Григорович',
            'Шевченка Тараса Григоровича',
            'Шевченкові Тарасові Григоровичу',
            'Шевченка Тараса Григоровича',
            'Шевченком Тарасом Григоровичем',
            'Шевченкові Тарасові Григоровичу',
            'Шевченче Тарасе Григоровичу'
        ];

        const result = ncl.qFullName('Шевченко', 'Тарас', 'Григорович', 1, -1);

        assert.strictEqual(
            result.join(','),
            expect.join(','),
        );
    });

    it(`q()`, () => {
        const expect = [
            'Шевченко Тарас Григорович',
            'Шевченка Тараса Григоровича',
            'Шевченкові Тарасові Григоровичу',
            'Шевченка Тараса Григоровича',
            'Шевченком Тарасом Григоровичем',
            'Шевченкові Тарасові Григоровичу',
            'Шевченче Тарасе Григоровичу',
        ];

        const result = ncl.q('Шевченко Тарас Григорович');
        // const result = ncl.q('Шевченко Тарас Григорович', -1, NCL.MAN);
        // const result = ncl.q('Шевченко', -1, NCL.MAN);
        // const result = ncl.q('Тарас', -1, NCL.MAN);
        // const result = ncl.q('Григорович', -1, NCL.MAN);

        assert.strictEqual(
            result.join(','),
            expect.join(','),
        );
    });
});
