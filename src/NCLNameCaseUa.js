/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

import NCLNameCaseCore from './NCL/NCLNameCaseCore.js';
import NCLNameCaseWord from './NCL/NCLNameCaseWord.js';
import NCLStr from './NCL/NCLStr.js';

var math_min = require('locutus/php/math/min');
var math_max = require('locutus/php/math/max');

/**
 * **NCL NameCase Ukranian Language**
 * 
 * The declension rules of the Ukrainian anthroponyms (Name, Surname, Patronymic).
 * The rules for determining a person's gender by their full name for the Ukrainian language.
 * System of separation of surnames, names, and patronymics for the Ukrainian language.
 * 
 * @author Andriy Chaika <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCLNameCaseUa extends NCLNameCaseCore {
    constructor() {
        super();

        /**
         * Language file version
         * @var string
         */
        this._languageBuild = '11071222';

        /**
         * The number of cases in the language
         * @var int
         */
        this.CaseCount = 7;

        /**
         * ```yaml
         * EN: Vowel Sounds
         * UK: Голосні звуки
         * ```
         * @var string
         */
        this.vowels = 'аеиоуіїєюя';

        /**
         * ```yaml
         * EN: Consonant Sounds
         * UK: Приголосні звуки
         * ```
         * @var string
         */
        this.consonant = 'бвгджзйклмнпрстфхцчшщ';

        /**
         * ```yaml
         * EN: Sibilant (consonant) Sounds
         * UK: Шиплячі (приголосні) звуки
         * ```
         * @var string
         */
        this.shyplyachi = 'жчшщ';

        /**
         * ```yaml
         * EN: Hard Mute Consonants
         * UK: Глухі тверді приголосні
         * ```
         * @var string
         */
        this.neshyplyachi = 'бвгдзклмнпрстфхц';

        /**
         * ```yaml
         * EN: Soft Sounds
         * UK: М’які звуки
         * ```
         * @var string
         */
        this.myaki = 'ьюяєї';

        /**
         * ```yaml
         * EN: Labial Sounds
         * UK: Губні звуки
         * ```
         * @var string
         */
        this.gubni = 'мвпбф';
    }


    /**
     * Alternation of consonants `г` `к` `х` —» `з` `ц` `с`.
     * @param string letter A letter that needs to be checked for the alternation
     * @return string An alternative letter
     */
    inverseGKH(letter) {
        switch (letter) {
            case 'г': return 'з';
            case 'к': return 'ц';
            case 'х': return 'с';
        }

        return letter;
    }

    /**
     * Tests whether the given character is an apostrophe.
     * @param string(1) char A symbol to check
     * @return bool true if the character is an apostrophe
     */
    isApostrof(char) {
        if (this.in(char, ' ' + this.consonant + this.vowels)) {
            return false;
        }

        return true;
    }

    /**
     * Alternation of consonants `г` `к` —» `ж` `ч`.
     * @param string letter A letter that needs to be checked for the alternation
     * @return string An alternative letter
     */
    inverse2(letter) {
        switch (letter) {
            case 'к': return 'ч';
            case 'г': return 'ж';
        }

        return letter;
    }

    /**
     * **Definition of noun groups for the 2nd declension**
     * ```
     * 1 - solid (тверда)
     * 2 - mixed (мішана)
     * 3 - soft (м’яка)
     * ```
     * **Rules:**
     * - Nouns with stems ending in hard non-sibilant sounds belong to the solid group, such as:
     *   береза (birch), дорога (road), Дніпро (Dnipro), шлях (path), віз (wagon), село (village), яблуко (apple).
     * 
     * - Nouns with stems ending in hard sibilant sounds belong to the mixed group:
     *   пожеж-а (fire), пущ-а (forest), тиш-а (silence), алич-а (cherry plum), вуж (grass snake), кущ (bush),
     *   плющ (ivy), ключ (key), плече (shoulder), прізвище (last name).
     * 
     * - Nouns with stems ending in any soft or softened sound belong to the soft group:
     *   земля [земл’а] (earth), зоря [зор’а] (star), армія [арм’ійа] (army), сім’я [с’імйа] (family),
     *   серпень (August), фахівець (specialist), трамвай (tram), сузір’я [суз’ірйа] (constellation),
     *   насіння [насін’н’а] (seeds), узвишшя (hill).
     * 
     * @param string word The noun for which the group needs to be determined
     * @return int The noun group number
     */
    detect2Group(word) {
        var osnova = word;
        var stack = [];

        // Cut the word until we encounter a consonant and push all vowels encountered onto the stack
        while (this.in(NCLStr.substr(osnova, -1, 1), this.vowels + 'ь')) {
            stack.push(NCLStr.substr(osnova, -1, 1));
            osnova = NCLStr.substr(osnova, 0, NCLStr.strlen(osnova) - 1);
        }

        var stacksize = stack.length;
        var Last = 'Z'; // zero termination

        if (stacksize) {
            Last = stack[stack.length - 1];
        }

        var osnovaEnd = NCLStr.substr(osnova, -1, 1);

        if (this.in(osnovaEnd, this.neshyplyachi) && !this.in(Last, this.myaki)) {
            return 1;
        } else if (this.in(osnovaEnd, this.shyplyachi) && !this.in(Last, this.myaki)) {
            return 2;
        } else {
            return 3;
        }
    }

    /**
     * Search for the first occurrence of a letter from the list of `vowels` in the `word`,
     * starting from the end.
     * 
     * @param string word A word in which vowels must be found
     * @param string vowels A list of letters to be found
     * @return string(1) The first letter from the end of the list of `vowels`
     */
    FirstLastVowel(word, vowels) {
        var length = NCLStr.strlen(word);

        for (var i = length - 1; i > 0; i--) {
            var char = NCLStr.substr(word, i, 1);

            if (this.in(char, vowels)) {
                return char;
            }
        }
    }

    /**
     * Search for the stem of the noun `word`.
     * The **stem of a word** is a typically unchanged part that indicates its lexical meaning.
     * 
     * @param string word The word in which the stem must be found
     * @return string основа іменника `word`
     */
    getOsnova(word) {
        var osnova = word;
        // Cut the word until we encounter a consonant

        while (this.in(NCLStr.substr(osnova, -1, 1), this.vowels + 'ь')) {
            osnova = NCLStr.substr(osnova, 0, NCLStr.strlen(osnova) - 1);
        }

        return osnova;
    }

    /**
     * Ukrainian masculine and feminine names ending in -а (-я) in the nominative singular
     * are declined similarly to corresponding nouns of the first declension.
     * 
     * - Note 1. The final consonants of the stem in feminine names, such as `г`, `к`, `х`,
     *   change to `з`, `ц`, `с` in the dative and locative singular before the ending `-і`: 
     *   Оль**г**а - Оль**з**і, Пала**жк**а - Пала**жц**і, Соло**х**а - Соло**с**і.
     * 
     * - Note 2. In feminine names like Одарка, Параска, in the genitive plural,
     *   the sound о appears in the stem between consonants: Одарок, Парасок.
     * 
     * @return boolean true - if a rule from the list was applied, false - if the rule was not found
     */
    manRule1() {
        // Penultimate char
        var BeforeLast = this.Last(2, 1);
        var invBeforeLast = this.inverseGKH(BeforeLast);

        // The last letter or "а"
        if (this.Last(1) == 'а') {
            this.wordForms(this.workingWord, [BeforeLast + 'и', invBeforeLast + 'і', BeforeLast + 'у', BeforeLast + 'ою', invBeforeLast + 'і', BeforeLast + 'о'], 2);
            this.Rule(101);

            return true;
        }

        // The last letter "я"
        else if (this.Last(1) == 'я') {
            // The last letter is preceded by "я"
            if (BeforeLast == 'і') {

                this.wordForms(this.workingWord, ['ї', 'ї', 'ю', 'єю', 'ї', 'є'], 1);
                this.Rule(102);

                return true;

            } else {

                this.wordForms(this.workingWord, [BeforeLast + 'і', invBeforeLast + 'і', BeforeLast + 'ю', BeforeLast + 'ею', invBeforeLast + 'і', BeforeLast + 'е'], 2);
                this.Rule(103);

                return true;

            }
        }

        return false;
    }

    /**
     * Names ending in `-р` in the nominative case have `-а` in the genitive:
     * Віктор - Віктора, Макар - Макара, but: Ігор - Ігоря, Лазар - Лазаря.
     * 
     * @return boolean true - if a rule from the list was applied, false - if no rule was found
     */
    manRule2() {
        if (this.Last(1) == 'р') {
            if (this.inNames(this.workingWord, ['Ігор', 'Лазар'])) {

                this.wordForms(this.workingWord, ['я', 'еві', 'я', 'ем', 'еві', 'е']);
                this.Rule(201);

                return true;

            } else {

                var osnova = this.workingWord;

                if (NCLStr.substr(osnova, -2, 1) == 'і') {
                    osnova = NCLStr.substr(osnova, 0, NCLStr.strlen(osnova) - 2) + 'о' + NCLStr.substr(osnova, -1, 1);
                }

                this.wordForms(osnova, ['а', 'ові', 'а', 'ом', 'ові', 'е']);
                this.Rule(202);

                return true;

            }
        }

        return false;
    }

    /**
     * Ukrainian masculine names ending in a consonant and `-о` in the nominative singular are declined
     * like corresponding nouns of the second declension.
     * 
     * @return boolean true - if a rule from the list was applied, false - if no rule was found
     */
    manRule3() {
        // Penultimate char
        var BeforeLast = this.Last(2, 1);

        if (this.in(this.Last(1), this.consonant + 'оь')) {
            var group = this.detect2Group(this.workingWord);
            var osnova = this.getOsnova(this.workingWord);

            // Vowel alternation "і" to "о" inside.
            // 
            // In names like "Антін", "Нестір", "Нечипір", "Прокіп", "Сидір", "Тиміш", "Федір",
            // the vowel "і" only appears in the nominative case,
            // while in the oblique cases, it changes to "о": "Антона", "Антонові"

            var osLast = NCLStr.substr(osnova, -1, 1);
            var invOsLast = this.inverse2(osLast);

            if (osLast != 'й' && NCLStr.substr(osnova, -2, 1) == 'і'
                && !this.in(NCLStr.substr(NCLStr.strtolower(osnova), -4, 4), ['світ', 'цвіт'])
                && !this.inNames(this.workingWord, 'Гліб')
                && !this.in(this.Last(2), ['ік', 'іч'])) {

                osnova = NCLStr.substr(osnova, 0, NCLStr.strlen(osnova) - 2) + 'о' + NCLStr.substr(osnova, -1, 1);
            }

            // Loss of the letter "е" when declining words like "Орел"
            if (NCLStr.substr(osnova, 0, 1) == 'о'
                && this.FirstLastVowel(osnova, this.vowels + 'гк') == 'е'
                && this.Last(2) != 'сь') {

                var delim = NCLStr.strrpos(osnova, 'е');
                osnova = NCLStr.substr(osnova, 0, delim) + NCLStr.substr(osnova, delim + 1, NCLStr.strlen(osnova) - delim);
            }

            if (group == 1) {
                // Solid group (тверда група)

                // The words ending in "ок"
                if (this.Last(2) == 'ок' && this.Last(3) != 'оок') {
                    this.wordForms(this.workingWord, ['ка', 'кові', 'ка', 'ком', 'кові', 'че'], 2);
                    this.Rule(301);

                    return true;
                }

                // Russian patronymic surnames ending in "ов", "ев", "єв"
                else if (this.in(this.Last(2), ['ов', 'ев', 'єв'])
                    && !this.inNames(this.workingWord, ['Лев', 'Остромов'])) {

                    this.wordForms(osnova, [osLast + 'а', osLast + 'у', osLast + 'а', osLast + 'им', osLast + 'у', invOsLast + 'е'], 1);
                    this.Rule(302);

                    return true;
                }

                // Russian surnames ending in "ін"
                else if (this.in(this.Last(2), ['ін'])) {
                    this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'у', 'е']);
                    this.Rule(303);

                    return true;
                } else {

                    this.wordForms(osnova, [osLast + 'а', osLast + 'ові', osLast + 'а', osLast + 'ом', osLast + 'ові', invOsLast + 'е'], 1);
                    this.Rule(304);

                    return true;

                }
            }

            if (group == 2) {
                // Mixed group (мішана група)

                this.wordForms(osnova, ['а', 'еві', 'а', 'ем', 'еві', 'е']);
                this.Rule(305);

                return true;
            }

            if (group == 3) {
                // Soft Group (м’яка група)

                // "Соловей"
                if (this.Last(2) == 'ей' && this.in(this.Last(3, 1), this.gubni)) {

                    osnova = NCLStr.substr(this.workingWord, 0, NCLStr.strlen(this.workingWord) - 2) + '’';

                    this.wordForms(osnova, ['я', 'єві', 'я', 'єм', 'єві', 'ю']);
                    this.Rule(306);

                    return true;

                } else if (this.Last(1) == 'й' || BeforeLast == 'і') {

                    this.wordForms(this.workingWord, ['я', 'єві', 'я', 'єм', 'єві', 'ю'], 1);
                    this.Rule(307);

                    return true;

                }

                // "Швець"
                else if (this.workingWord == 'швець') {

                    this.wordForms(this.workingWord, ['евця', 'евцеві', 'евця', 'евцем', 'евцеві', 'евцю'], 4);
                    this.Rule(308);

                    return true;

                }

                // The words ending in "ець"
                else if (this.Last(3) == 'ець') {

                    this.wordForms(this.workingWord, ['ця', 'цеві', 'ця', 'цем', 'цеві', 'цю'], 3);
                    this.Rule(309);

                    return true;

                }

                // The words ending in "єць", "яць"
                else if (this.in(this.Last(3), ['єць', 'яць'])) {

                    this.wordForms(this.workingWord, ['йця', 'йцеві', 'йця', 'йцем', 'йцеві', 'йцю'], 3);
                    this.Rule(310);

                    return true;

                } else {

                    this.wordForms(osnova, ['я', 'еві', 'я', 'ем', 'еві', 'ю']);
                    this.Rule(311);

                    return true;

                }
            }
        }

        return false;
    }

    /**
     * If a word ends in `і`, it is declined as a plural.
     * @return boolean true - if the rule from the list was applied, false - if the rule was not found
     */
    manRule4() {
        if (this.Last(1) == 'і') {

            this.wordForms(this.workingWord, ['их', 'им', 'их', 'ими', 'их', 'і'], 1);
            this.Rule(4);

            return true;

        }

        return false;
    }

    /**
     * If a word ends in `ий` or `ой`.
     * @return boolean true - if the rule from the list was applied, false - if the rule was not found
     */
    manRule5() {
        if (this.in(this.Last(2), ['ий', 'ой'])) {

            this.wordForms(this.workingWord, ['ого', 'ому', 'ого', 'им', 'ому', 'ий'], 2);
            this.Rule(5);

            return true;

        }

        return false;
    }

    /**
     * Ukrainian masculine and feminine names ending in `-а` `-я` in the nominative singular
     * are declined like corresponding nouns of the first declension.
     * 
     * - Note 1. The final consonants of the stems `г`, `к`, `х` in feminine names in the dative
     *   and locative singular before the ending `-і` change to `з`, `ц`, `с`:
     *   Ольга - Ользі, Палажка - Палажці, Солоха - Солосі.
     * 
     * - Note 2. In feminine names like Одарка, Параска, in the genitive plural the sound `о`
     *   appears at the end of the stem between consonants: Одарок, Парасок.
     * 
     * @return boolean true - if the rule from the list was applied, false - if the rule was not found
     */
    womanRule1() {
        // Penultimate char
        var BeforeLast = this.Last(2, 1);
        var invBeforeLast = this.inverseGKH(BeforeLast);

        // The words ending in "ніга" -» "нога"
        if (this.Last(4) == 'ніга') {
            var osnova = NCLStr.substr(this.workingWord, 0, NCLStr.strlen(this.workingWord) - 3) + 'о';

            this.wordForms(osnova, ['ги', 'зі', 'гу', 'гою', 'зі', 'го']);
            this.Rule(101);

            return true;
        }

        // The last letter or "а"
        else if (this.Last(1) == 'а') {

            this.wordForms(this.workingWord, [BeforeLast + 'и', invBeforeLast + 'і', BeforeLast + 'у', BeforeLast + 'ою', invBeforeLast + 'і', BeforeLast + 'о'], 2);
            this.Rule(102);

            return true;

        }

        // The last letter "я"
        else if (this.Last(1) == 'я') {
            if (this.in(BeforeLast, this.vowels) || this.isApostrof(BeforeLast)) {

                this.wordForms(this.workingWord, ['ї', 'ї', 'ю', 'єю', 'ї', 'є'], 1);
                this.Rule(103);

                return true;

            } else {

                this.wordForms(this.workingWord, [BeforeLast + 'і', invBeforeLast + 'і', BeforeLast + 'ю', BeforeLast + 'ею', invBeforeLast + 'і', BeforeLast + 'е'], 2);
                this.Rule(104);

                return true;

            }
        }

        return false;
    }

    /**
     * Ukrainian feminine names ending in a consonant in the nominative singular are declined like
     * corresponding nouns of the third declension.
     * 
     * @return boolean true - if the rule from the list was applied, false - if the rule was not found
     */
    womanRule2() {
        if (this.in(this.Last(1), this.consonant + 'ь')) {
            var osnova = this.getOsnova(this.workingWord);
            var apostrof = '';
            var duplicate = '';
            var osLast = NCLStr.substr(osnova, -1, 1);
            var osBeforeLast = NCLStr.substr(osnova, -2, 1);

            // Determines whether to put an apostrophe
            if (this.in(osLast, 'мвпбф') && this.in(osBeforeLast, this.vowels)) {
                apostrof = '’';
            }

            // Determines whether to double
            if (this.in(osLast, 'дтзсцлн')) {
                duplicate = osLast;
            }


            // Decline
            if (this.Last(1) == 'ь') {

                this.wordForms(osnova, ['і', 'і', 'ь', duplicate + apostrof + 'ю', 'і', 'е']);
                this.Rule(201);

                return true;

            } else {

                this.wordForms(osnova, ['і', 'і', '', duplicate + apostrof + 'ю', 'і', 'е']);
                this.Rule(202);

                return true;

            }
        }

        return false;
    }

    /**
     * If the word ends in `ськ` or a Russian surname is encountered.
     * @return boolean true - if the rule from the list was applied, false - if the rule was not found
     */
    womanRule3() {
        // Penultimate letter
        var BeforeLast = this.Last(2, 1);

        // "Донская"
        if (this.Last(2) == 'ая') {

            this.wordForms(this.workingWord, ['ої', 'ій', 'ую', 'ою', 'ій', 'ая'], 2);
            this.Rule(301);

            return true;

        }

        // The words ending in "ськ"
        if (this.Last(1) == 'а' && (this.in(this.Last(2, 1), 'чнв') || this.in(this.Last(3, 2), ['ьк']))) {

            this.wordForms(this.workingWord, [BeforeLast + 'ої', BeforeLast + 'ій', BeforeLast + 'у', BeforeLast + 'ою', BeforeLast + 'ій', BeforeLast + 'о'], 2);
            this.Rule(302);

            return true;

        }

        return false;
    }

    /**
     * Attempts to apply a sequence of rules for the male name.
     * @return boolean True if any of the rules were applied; False otherwise
     */
    manFirstName() {
        return this.RulesChain('man', [1, 2, 3]);
    }

    /**
     * Attempts to apply a sequence of rules for the female name.
     * @return boolean True if any of the rules were applied; False otherwise
     */
    womanFirstName() {
        return this.RulesChain('woman', [1, 2]);
    }

    /**
     * Attempts to apply a sequence of rules for the male surname.
     * @return boolean True if any of the rules were applied; False otherwise
     */
    manSecondName() {
        return this.RulesChain('man', [5, 1, 2, 3, 4]);
    }

    /**
     * Attempts to apply a sequence of rules for the female surname.
     * @return boolean True if any of the rules were applied; False otherwise
     */
    womanSecondName() {
        return this.RulesChain('woman', [3, 1]);
    }

    /**
     * Inflects the patronymic of male anthroponym.
     * @return boolean True - if the word was successfully inflected; false - otherwise
     */
    manFatherName() {
        if (this.in(this.Last(2), ['ич', 'іч'])) {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ем', 'у', 'у']);
            return true;

        }

        return false;
    }

    /**
     * Inflects the patronymic of female anthroponym.
     * @return boolean True - if the word was successfully inflected; false - otherwise
     */
    womanFatherName() {
        if (this.in(this.Last(3), ['вна'])) {

            this.wordForms(this.workingWord, ['и', 'і', 'у', 'ою', 'і', 'о'], 1);
            return true;

        }

        return false;
    }

    /**
     * Determination of gender, according to the rules of the name.
     * @param NCLNameCaseWord word An object with the word for which itʼs necessary to determine the gender
     */
    GenderByFirstName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception('word should be of class NCLNameCaseWord');

        this.setWorkingWord(word.getWord());

        var man = 0;
        var woman = 0;

        // Try to find the maximum info out of the name
        // If the name ends in "й", it is most likely a masculine

        if (this.Last(1) == 'й') {
            man += 0.9;
        }

        if (this.inNames(this.workingWord, ['Петро', 'Микола'])) {
            man += 30;
        }

        if (this.in(this.Last(2), ['он', 'ов', 'ав', 'ам', 'ол', 'ан', 'рд', 'мп', 'ко', 'ло'])) {
            man += 0.5;
        }

        if (this.in(this.Last(3), ['бов', 'нка', 'яра', 'ила', 'опа'])) {
            woman += 0.5;
        }

        if (this.in(this.Last(1), this.consonant)) {
            man += 0.01;
        }

        if (this.Last(1) == 'ь') {
            man += 0.02;
        }

        if (this.in(this.Last(2), ['дь'])) {
            woman += 0.1;
        }

        if (this.in(this.Last(3), ['ель', 'бов'])) {
            woman += 0.4;
        }

        word.setGender(man, woman);
    }

    /**
     * Determination of gender, according to the rules of the surname.
     * @param NCLNameCaseWord word An object with the word for which itʼs necessary to determine the gender
     */
    GenderBySecondName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception('word should be of class NCLNameCaseWord');

        this.setWorkingWord(word.getWord());

        var man = 0;
        var woman = 0;

        if (this.in(this.Last(2), ['ов', 'ин', 'ев', 'єв', 'ін', 'їн', 'ий', 'їв', 'ів', 'ой', 'ей'])) {
            man += 0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ина', 'ева', 'єва', 'іна', 'мін'])) {
            woman += 0.4;
        }

        if (this.in(this.Last(2), ['ая'])) {
            woman += 0.4;
        }

        word.setGender(man, woman);
    }

    /**
     * Determination of gender, according to the rules of the patronymic.
     * @param NCLNameCaseWord word An object with the word for which itʼs necessary to determine the gender
     */
    GenderByFatherName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception('word should be of class NCLNameCaseWord');

        this.setWorkingWord(word.getWord());

        if (this.Last(2) == 'ич') {
            word.setGender(10, 0); // Masculine
        }

        if (this.Last(2) == 'на') {
            word.setGender(0, 12); // Feminine
        }
    }

    /**
     * Analyzing the `word` and determining its anthroponym by Name, Surname, and Patronymic.
     * - **N** - Name (First Name)
     * - **S** - Surname (Second Name)
     * - **F** - Father’s Name (Patronymic)
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring determination
     */
    detectNamePart(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception('word should be of class NCLNameCaseWord');

        var namepart = word.getWord();
        this.setWorkingWord(namepart);

        // Compute the probability of coincidence
        var first = 0;
        var second = 0;
        var father = 0;

        // similar to a patronymic anthroponym
        if (this.in(this.Last(3), ['вна', 'чна', 'ліч']) || this.in(this.Last(4), ['ьмич', 'ович'])) {
            father += 3;
        }

        // similar to a first name anthroponym
        if (this.in(this.Last(3), ['тин' /* {endings_sirname3} */]) || this.in(this.Last(4), ['ьмич', 'юбов', 'івна', 'явка', 'орив', 'кіян' /* {endings_sirname4} */])) {
            first += 0.5;
        }

        // exceptions
        if (this.inNames(namepart, ['Лев', 'Гаїна', 'Афіна', 'Антоніна', 'Ангеліна', 'Альвіна', 'Альбіна', 'Аліна', 'Павло', 'Олесь', 'Микола', 'Мая', 'Англеліна', 'Елькін', 'Мерлін'])) {
            first += 10;
        }

        // similar to a second name anthroponym
        if (this.in(this.Last(2), ['ов', 'ін', 'ев', 'єв', 'ий', 'ин', 'ой', 'ко', 'ук', 'як', 'ца', 'их', 'ик', 'ун', 'ок', 'ша', 'ая', 'га', 'єк', 'аш', 'ив', 'юк', 'ус', 'це', 'ак', 'бр', 'яр', 'іл', 'ів', 'ич', 'сь', 'ей', 'нс', 'яс', 'ер', 'ай', 'ян', 'ах', 'ць', 'ющ', 'іс', 'ач', 'уб', 'ох', 'юх', 'ут', 'ча', 'ул', 'вк', 'зь', 'уц', 'їн', 'де', 'уз', 'юр', 'ік', 'іч', 'ро' /* {endings_name2} */])) {
            second += 0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ева', 'єва', 'тих', 'рик', 'вач', 'аха', 'шен', 'мей', 'арь', 'вка', 'шир', 'бан', 'чий', 'іна', 'їна', 'ька', 'ань', 'ива', 'аль', 'ура', 'ран', 'ало', 'ола', 'кур', 'оба', 'оль', 'нта', 'зій', 'ґан', 'іло', 'шта', 'юпа', 'рна', 'бла', 'еїн', 'има', 'мар', 'кар', 'оха', 'чур', 'ниш', 'ета', 'тна', 'зур', 'нір', 'йма', 'орж', 'рба', 'іла', 'лас', 'дід', 'роз', 'аба', 'чан', 'ган' /* {endings_name3} */])) {
            second += 0.4;
        }

        if (this.in(this.Last(4), ['ьник', 'нчук', 'тник', 'кирь', 'ский', 'шена', 'шина', 'вина', 'нина', 'гана', 'гана', 'хній', 'зюба', 'орош', 'орон', 'сило', 'руба', 'лест', 'мара', 'обка', 'рока', 'сика', 'одна', 'нчар', 'вата', 'ндар', 'грій' /* {endings_name4} */])) {
            second += 0.4;
        }

        if (this.Last(1) == 'і') {
            second += 0.2;
        }

        var max = math_max([first, second, father]);

        if (first == max) {
            word.setNamePart('N');
        } else if (second == max) {
            word.setNamePart('S');
        } else {
            word.setNamePart('F');
        }
    }
}
