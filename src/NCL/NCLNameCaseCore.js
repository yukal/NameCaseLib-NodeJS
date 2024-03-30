/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

const NCL = require('./NCL.js');
const NCLNameCaseWord = require('./NCLNameCaseWord.js');

/**
 * **NCL NameCase Core**
 * 
 * The set of core functions enables making the interface for Ukrainian and Russian language inflection
 * absolutely identical. It contains all the functions for external interaction with the library.
 * 
 * Inflection refers to the modification of a word to express different grammatical categories such as
 * tense, mood, aspect, voice, person, number, gender, and case. In languages like Russian and Ukrainian,
 * inflection plays a significant role in indicating these grammatical features.
 * 
 * @author Andriy Chaika <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
class NCLNameCaseCore extends NCL {
    constructor() {
        super();

        /**
         * Library version
         * @var string
         */
        this._version = '0.4.1';

        /**
         * Language file version
         * @var string
         */
        this._languageBuild = '0';

        /**
         * System readiness:
         * - All words have been identified (it is known which part of the full name the word belongs to);
         * - Gender has been determined for all words;
         * 
         * If everything is done, the flag is set to true. When adding a new word, the flag is reset to false
         * 
         * @var bool
         */
        this.ready = false;

        /**
         * If all current words have been processed and each word already has a declension result, then true.
         * If a new word has been added, the flag is reset to false.
         * 
         * @var bool
         */
        this.finished = false;

        /**
         * The words array contains elements of NCLNameCaseWord type. It contains words that need to be
         * processed using inflection.
         * 
         * @var array
         */
        this.words = [];

        /**
         * A variable containing the word over which declension is performed.
         * @var string
         */
        this.workingWord = '';

        /**
         * Cache for the method Last().
         * 
         * Since the method Last() may be called multiple times with the same parameters during the inflection process,
         * its subsequent invocation with the same parameters will immediately return the previously recorded result.
         * 
         * @see Last
         * @var array
         */
        this.workingLastCache = [];

        /**
         * The number of the last used rule. Set by the method Rule().
         * 
         * @see Rule
         * @var int
         */
        this.lastRule = 0;

        /**
         * The array contains the results of word declension - the word in all cases.
         * @var array
         */
        this.lastResult = [];

        /**
         * The array contains information about which words from the `this.words` array relate to surnames
         * that include a given name in addition to their patronymic. This array is necessary because when
         * adding words, we may not always know their position within the full name.
         * Therefore, after identifying all the words, the array indices are automatically converted for
         * quick future reference.
         * 
         * @var array
         */
        this.index = {};

        // Probability of automatic gender detection [0..10]. Fairly accurate at 0.1
        this.gender_koef = 0;
    }

    /**
     * Clears the results of the last declension for a word. This is necessary when declension is performed
     * for multiple words.
     */
    reset() {
        this.lastRule = 0;
        this.lastResult = [];
    }

    /**
     * Resets all information to its initial state. Clears all words added to this object.
     * After execution, the object is ready to work from the beginning.
     * 
     * @return NCLNameCaseCore
     */
    fullReset() {
        this.words = [];
        this.index = { 'N': [], 'F': [], 'S': [] };
        this.reset();
        this.notReady();

        return this;
    };

    /**
     * Sets flags indicating that the object is not ready and words have not yet been inflected.
     */
    notReady() {
        this.ready = false;
        this.finished = false;
    }

    /**
     * Sets the number of the last rule.
     * @param int index The rule number to be set
     */
    Rule(index) {
        this.lastRule = index;
    }

    /**
     * Set the current word for the inflection process and clear cache.
     * @param string word The word to be set
     */
    setWorkingWord(word) {
        // Reset the settings
        this.reset();

        // Set a new word
        this.workingWord = word;

        // Clear the cache
        this.workingLastCache = [];
    }

    /**
     * If there is no need to inflect a word, then set the result to the same as the nominative case.
     */
    makeResultTheSame() {
        this.lastResult = Array(this.CaseCount).fill(this.workingWord);
    }

    /**
     * Returns the portion of string.
     * 
     * The returned string will start at the position specified by the `length` parameter, starting from the
     * right side of the string to the end of the string. For instance, in the string 'abcdef', the character
     * at position 1 is 'f', the character at position 2 is 'e', and so forth.
     * 
     * In the case when the optional parameter `stopAfter` is specified, the returned string will contain a
     * portion of the cut string whose length is determined by the `stopAfter` parameter.
     * 
     * Example:
     * 'abcdef' -> Last(3, 2) -> 'de'
     * 
     * @param int length Number of letters from the end
     * @param int stopAfter (optional) Number of letters to be cut (0 - all of them)
     * @return string Portion of string from the right side
     */
    Last(length = 1, stopAfter = 0) {
        var cut = stopAfter > 0
            ? this.workingWord.length - length + stopAfter
            : undefined;

        // Check the cache
        if (this.workingLastCache[length] == undefined) {
            this.workingLastCache[length] = [];
        }

        if (this.workingLastCache[length][stopAfter] == undefined) {
            this.workingLastCache[length][stopAfter] = this.workingWord.slice(-length, cut);
        }

        return this.workingLastCache[length][stopAfter];
    }

    /**
     * Executes the rules step by step according to the passed parameters, and returns the success flag of
     * the operation.
     * 
     * Example:
     * ```
     * this.RulesChain('man', [1, 2, 3]);
     * this.RulesChain('woman', [1, 2]);
     * ```
     * 
     * @param string gender What kind of cases should be used [masculine | feminine]
     * @param array rulesArray - An array of integers indicating the order in which the rules are executed
     * @return boolean True if any of the rules were applied; False otherwise
     */
    RulesChain(gender, rulesArray) {
        for (var ruleID of rulesArray) {
            var ruleMethod = gender + 'Rule' + ruleID;

            if (typeof this[ruleMethod] != 'function') {
                throw new Error(`Method ${ruleMethod} not found`);
            }

            if (this[ruleMethod]()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Search string inside array or letter in string.
     * 
     * If a string is passed as the second parameter, then it will check for the letter `letter` is included in the string `string`.
     * If an array is passed as the second parameter, then it will check for the string `letter` is included in the array `string`.
     * 
     * @param string letter Letter or String to search for
     * @param mixed string String or Array to search in
     * @return bool True if the required value is found
     */
    in(letter, string) {
        return letter && string.includes(letter);
    }

    /**
     * The function checks whether the name `nameNeedle` is included in the list of names `names`.
     * 
     * @param string nameNeedle The name to be found
     * @param array names A list of names in which to find a name
     */
    inNames(nameNeedle, names) {
        if (!Array.isArray(names)) {
            names = [names];
        }

        for (var name of names) {
            if (nameNeedle.toLowerCase() == name.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    /**
     * It inflects the `word`, removing the last letters from the `replaceLast`
     * and adding an `endings` array to each case.
     * 
     * @param string word The word to which to add an ending
     * @param array endings The collection of word endings
     * @param int replaceLast How many last letters must be removed from the initial word
     */
    wordForms(word, endings, replaceLast = 0) {
        // Create an array with the nominative case
        var result = [this.workingWord];

        // Remove the extra letters at the end
        word = word.substring(0, word.length - replaceLast);

        // Add endings
        for (var padegIndex = 1; padegIndex < this.CaseCount; padegIndex++) {
            result[padegIndex] = word + endings[padegIndex - 1];
        }

        this.lastResult = result;
    }

    /**
     * Creates a new instance of the `NCLNameCaseWord` including a `firstname` parameter and adds it
     * to the `words` array.
     * 
     * @param string firstname
     * @return NCLNameCaseCore
     */
    setFirstName(firstname = '') {
        if (firstname) {
            var newWord = new NCLNameCaseWord(firstname);
            newWord.setNamePart('N');

            this.words.push(newWord);
            this.notReady();
        }

        return this;
    }

    /**
     * Creates a new instance of the `NCLNameCaseWord` including a `secondname` parameter and adds it
     * to the `words` array.
     * 
     * @param string secondname
     * @return NCLNameCaseCore
     */
    setSecondName(secondname = '') {
        if (secondname) {
            var newWord = new NCLNameCaseWord(secondname);
            newWord.setNamePart('S');

            this.words.push(newWord);
            this.notReady();
        }

        return this;
    }

    /**
     * Creates a new instance of the `NCLNameCaseWord` including a `fathername` parameter and adds it
     * to the `words` array.
     * 
     * @param string fathername Patronymic
     * @return NCLNameCaseCore
     */
    setFatherName(fathername = '') {
        if (fathername) {
            var newWord = new NCLNameCaseWord(fathername);
            newWord.setNamePart('F');

            this.words.push(newWord);
            this.notReady();
        }

        return this;
    }

    /**
     * Sets the gender for all words provided in `this.words`, using these values:
     * - 0 - not determined
     * - NCL.MAN (masculine)
     * - NCL.WOMAN (feminine)
     * 
     * @param int gender
     * @return NCLNameCaseCore
     * 
     * @see NCL.MAN
     * @see NCL.WOMAN
     */
    setGender(gender = 0) {
        for (var word of this.words) {
            word.setTrueGender(gender);
        }

        return this;
    }

    /**
     * Sets the object state with the given parameters.
     * 
     * @param string secondName
     * @param string firstName
     * @param string fatherName Patronymic
     * @return NCLNameCaseCore
     * 
     * @see setFirstName
     * @see setSecondName
     * @see setFatherName
     */
    setFullName(secondName = '', firstName = '', fatherName = '') {
        this.setFirstName(firstName);
        this.setSecondName(secondName);
        this.setFatherName(fatherName);

        return this;
    }

    /**
     * Creates a new instance of the `NCLNameCaseWord` including a `firstname` parameter and adds it
     * to the `words` array.
     * 
     * @param string firstname
     * @return NCLNameCaseCore
     */
    setName(firstname = '') {
        return this.setFirstName(firstname);
    }

    /**
     * Creates a new instance of the `NCLNameCaseWord` including a `secondname` parameter, then adds it
     * to the `words` array and sets flags indicating that the object is not ready and words have not
     * yet been inflected.
     * 
     * @param string secondname
     * @return NCLNameCaseCore
     * 
     * @see setSecondName
     */
    setLastName(secondname = '') {
        return this.setSecondName(secondname);
    }

    /**
     * An alias for the setLastName method.
     * 
     * @param string secondname
     * @return NCLNameCaseCore
     * 
     * @see setLastName
     */
    setSirName(secondname = '') {
        return this.setSecondName(secondname);
    }

    /**
     * A language's child class method.
     * Analyze whether the anthroponym type was defined in the `word` parameter, if not, additional analysis
     * will be performed to determine its type, which are:
     * - Second Name
     * - First Name
     * - Patronymic
     * 
     * @param NCLNameCaseWord word
     * @see detectNamePart
     */
    prepareNamePart(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        if (!word.getNamePart()) {
            this.detectNamePart(word);
        }
    }

    /**
     * This method requires a language's child class method.
     * Check whether all given words have been defined by anthroponym type, if not, then each word will be
     * subjected to an additional analysis to determine the type:
     * - Second Name
     * - First Name
     * - Patronymic
     */
    prepareAllNameParts() {
        for (var word of this.words) {
            this.prepareNamePart(word);
        }
    }

    /**
     * This method requires a language's child class method.
     * Determines the gender of the anthroponym from the passed parameter `word`.
     * 
     * @param NCLNameCaseWord word The word for which to determine the gender
     * 
     * @see GenderByFirstName
     * @see GenderByFatherName
     * @see GenderBySecondName
     */
    prepareGender(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        if (!word.isGenderSolved()) {
            var namePart = word.getNamePart();

            switch (namePart) {
                case 'N': this.GenderByFirstName(word);
                    break;

                case 'F': this.GenderByFatherName(word);
                    break;

                case 'S': this.GenderBySecondName(word);
                    break;
            }
        }
    }

    /**
     * Check whether all given words have been defined by anthroponym gender, if not, then each word will be
     * subjected to an additional analysis to determine the gender:
     * - 0 - not determined
     * - NCL.MAN (masculine)
     * - NCL.WOMAN (feminine)
     * 
     * @return bool Was the gender determined
     */
    solveGender() {
        // Does the gender is already determined somewhere
        for (var word of this.words) {
            if (word.isGenderSolved()) {
                this.setGender(word.gender());
                return true;
            }
        }

        // If not, then determine each word and then sum it up
        var man = 0;
        var woman = 0;

        for (var word of this.words) {
            this.prepareGender(word);
            var gender = word.getGender();
            man += gender[NCL.MAN];
            woman += gender[NCL.WOMAN];
        }

        if (man > woman) {
            this.setGender(NCL.MAN);
        }
        else {
            this.setGender(NCL.WOMAN);
        }

        return true;
    }

    /**
     * Initializes a cache with three types of anthroponyms, each containing a separate array.
     * Each array, like a relational structure, contains an identifier that points to a specific index from
     * the `this.words`. Thus, this cache indicates the type of anthroponym that will contribute to the quick
     * search for the necessary type in further work.
     * 
     * The anthroponym types:
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     */
    generateIndex() {
        this.index = { 'N': [], 'S': [], 'F': [] };

        for (var index in this.words) {
            var word = this.words[index];
            var namepart = word.getNamePart();
            this.index[namepart].push(index);
        }
    }

    /**
     * Executes the initialization scenario for declension and sets the ready flag.
     * Performs the following steps:
     * - according to the entered parameters, analyzes their anthroponym types (name, surname, patronymic)
     * - analyzes and establishes the gender of an anthroponym (masculine, feminine)
     * - update the indexes in the cache
     * - sets the instance to the ready state
     * 
     * @see prepareAllNameParts
     * @see solveGender
     * @see generateIndex
     */
    prepareEverything() {
        if (!this.ready) {
            this.prepareAllNameParts();
            this.solveGender();
            this.generateIndex();
            this.ready = true;
        }
    }

    /**
     * Executes the initialization scenario for declension, determines and returns the anthroponym gender:
     * - 0 - not determined
     * - NCL.MAN (masculine)
     * - NCL.WOMAN (feminine)
     * 
     * @return int A gender
     * 
     * @see prepareEverything
     */
    genderAutoDetect() {
        this.prepareEverything();

        if (this.words.length) {
            var n = -1;
            var max_koef = -1;

            for (var k of this.words) {
                var word = this.words[k];
                var genders = word.getGender();
                var min = Math.min(...genders);
                var max = Math.max(...genders);
                var koef = max - min;
                if (koef > max_koef) {
                    max_koef = koef;
                    n = k;
                }
            }

            if (n >= 0) {
                if (this.words[n]) {
                    genders = this.words[n].getGender();
                    min = Math.min(...genders);
                    max = Math.max(...genders);
                    this.gender_koef = max - min;

                    return this.words[n].gender();
                }
            }
        }

        return -1;
    }

    /**
     * Splits the `fullname` into anthroponym parts and inflects them.
     * 
     * @param string fullname "LastName FirstName Patronymic"
     * @return array An array of `NCLNameCaseWord`
     * 
     * @see prepareEverything
     */
    splitFullName(fullname) {
        fullname = trim(fullname);
        var list = explode(' ', fullname);

        for (var word of list) {
            this.words.push(new NCLNameCaseWord(word));
        }

        this.prepareEverything();
        var formatArr = [];

        for (var word of this.words) {
            formatArr.push(word.getNamePart());
        }

        return this.words;
    }

    /**
     * Splits the `fullname` into anthroponym parts, inflects them, and returns formatted anthroponym.
     * 
     * @param string fullname "LastName FirstName Patronymic"
     * @return string Formatted anthroponym
     * 
     * @see splitFullName
     */
    getFullNameFormat(fullname) {
        this.fullReset();
        var words = this.splitFullName(fullname);
        var format = '';

        for (var word of words) {
            format += word.getNamePart() + ' ';
        }

        return format;
    }

    /**
     * Inflects the `word` according to gender and the anthroponym type.
     * @param NCLNameCaseWord word An anthroponym
     */
    WordCase(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        var gender = (word.gender() == NCL.MAN ? 'man' : 'woman');

        var namepart = '';
        var name_part_letter = word.getNamePart();

        switch (name_part_letter) {
            case 'F': namepart = 'Father';
                break;

            case 'N': namepart = 'First';
                break;

            case 'S': namepart = 'Second';
                break;
        }

        var method = gender + namepart + 'Name';
        if (typeof this[method] != 'function') {
            throw new Error(`Method ${method} not found`);
        }

        // if the last name is 2 words with a hyphen
        // http://new.gramota.ru/spravka/buro/search-answer?s=273912

        // split the word with hyphens into chunks
        var tmp = word.getWordOrig();
        var cur_words = tmp.split('-');
        var o_cur_words = [];

        var result = {};
        var last_rule = -1;
        var cnt = cur_words.length;
        var result_tmp = this.lastResult;

        for (var k in cur_words) {
            var cur_word = cur_words[k];
            var is_norm_rules = true;

            var o_ncw = new NCLNameCaseWord(cur_word);
            if (name_part_letter == 'S' && cnt > 1 && k < cnt - 1) {
                // If the first part of the Surname is also a Surname, then inflect it
                // according to the general rules, otherwise, it can not be inflected

                var exclusion = ['тулуз']; // исключения

                if (!exclusion.includes(cur_word.toLowerCase())) {

                    var cls = NCL.getConcreteClass('ru');
                    var o_nc = new cls();

                    o_nc.detectNamePart(o_ncw);
                    is_norm_rules = (o_ncw.getNamePart() == 'S');

                } else {

                    is_norm_rules = false;

                }
            }

            this.setWorkingWord(cur_word);

            if (is_norm_rules && this[method]()) {

                // can be inflected

                result_tmp = this.lastResult;
                last_rule = this.lastRule;

            } else {

                // Can not be inflected. Fill all we have

                result_tmp = Array(this.CaseCount).fill(cur_word);
                last_rule = -1;

            }

            o_ncw.setNameCases(result_tmp);
            o_cur_words.push(o_ncw);
        }

        // combining a bunch of word parts into one word for each case
        for (var o_ncw of o_cur_words) {
            var namecases = o_ncw.getNameCases();

            for (var k in namecases) {
                var namecase = namecases[k];

                if (result.hasOwnProperty(k)) {
                    result[k] = result[k] + '-' + namecase;
                } else {
                    result[k] = namecase;
                }
            }
        }

        // set cases for the whole word
        word.setNameCases(Object.values(result), false);
        word.setRule(last_rule);
    }

    /**
     * Initializes the declension state, inflects all words stored in the `this.words`,
     * and sets a `finished` flag.
     * 
     * @see prepareEverything
     * @see WordCase
     */
    AllWordCases() {
        if (!this.finished) {
            this.prepareEverything();

            for (var word of this.words) {
                this.WordCase(word);
            }

            this.finished = true;
        }
    }

    /**
     * Returns an array or a string with the necessary inflection case.
     * If the `number` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param NCLNameCaseWord word The word for which we need to return the case
     * @param int number The inflection case number
     * @return mixed An array or a string with the necessary inflected case
     */
    getWordCase(/*NCLNameCaseWord*/ word, number = null) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        var cases = word.getNameCases();

        return number < 0 || number > (this.CaseCount - 1)
            ? cases : cases[number];
    }

    /**
     * Collects all the specified words in `indexArray` into one string.
     * 
     * @param array indexArray The indexes of the word that are necessary to be collected together
     * @param int number The case number
     * @return mixed Either an array with all cases, or a string with one case
     */
    getCasesConnected(indexArray, number = null) {
        var readyArr = indexArray.map((word) =>
            this.getWordCase(word, number));

        var all = readyArr.length;
        if (all) {
            if (Array.isArray(readyArr[0])) {

                // Glue each case

                var resultArr = [];
                for (var kase = 0; kase < this.CaseCount; kase++) {
                    var tmp = [];
                    for (var i = 0; i < all; i++) {
                        tmp.push(readyArr[i][kase]);
                    }
                    resultArr[kase] = tmp.join(' ');
                }

                return resultArr;

            } else {

                return readyArr.join(' ');

            }
        }

        return '';
    }

    /**
     * Starts `AllWordCases` scenario and sets the name to the appropriate case.
     * If the `number` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     *
     * @param int number Case number
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see AllWordCases
     * @see getCasesConnected
     */
    getFirstNameCase(number = null) {
        this.AllWordCases();
        return this.getCasesConnected(this.index['N'], number);
    }

    /**
     * Starts `AllWordCases` scenario and sets the surname to the appropriate case.
     * If the `number` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param int number Case number
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see AllWordCases
     * @see getCasesConnected
     */
    getSecondNameCase(number = null) {
        this.AllWordCases();
        return this.getCasesConnected(this.index['S'], number);
    }

    /**
     * Starts `AllWordCases` scenario and sets the patronymic to the appropriate case.
     * If the `number` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param int number Case number
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see AllWordCases
     * @see getCasesConnected
     */
    getFatherNameCase(number = null) {
        this.AllWordCases();
        return this.getCasesConnected(this.index['F'], number);
    }

    /**
     * Inflects the `firstName` according to its `gender` and the anthroponym type.
     * If the `CaseNumber` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param string firstName The First Name to inflect
     * @param int CaseNumber Case number
     * @param int gender In which the gender form should be inflected: Masculine|Feminine
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see fullReset
     * @see setFirstName
     * @see setGender
     * @see getFirstNameCase
     */
    qFirstName(firstName, CaseNumber = null, gender = 0) {
        this.fullReset();
        this.setFirstName(firstName);

        if (gender) {
            this.setGender(gender);
        }

        return this.getFirstNameCase(CaseNumber);
    }

    /**
     * Inflects the `secondName` according to its `gender` and the anthroponym type.
     * If the `CaseNumber` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param string secondName The Second Name to inflect
     * @param int CaseNumber Case number
     * @param int gender In which the gender form should be inflected: Masculine|Feminine
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see fullReset
     * @see setSecondName
     * @see setGender
     * @see getSecondNameCase
     */
    qSecondName(secondName, CaseNumber = null, gender = 0) {
        this.fullReset();
        this.setSecondName(secondName);

        if (gender) {
            this.setGender(gender);
        }

        return this.getSecondNameCase(CaseNumber);
    }

    /**
     * Inflects the `fatherName` according to its `gender` and the anthroponym type.
     * If the `CaseNumber` is specified, then a string according to its case number will returned,
     * otherwise, an array with all cases of the current word is returned.
     * 
     * @param string fatherName The Patronymic to inflect
     * @param int CaseNumber Case number
     * @param int gender In which the gender form should be inflected: Masculine|Feminine
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see fullReset
     * @see setFatherName
     * @see setGender
     * @see getFatherNameCase
     */
    qFatherName(fatherName, CaseNumber = null, gender = 0) {
        this.fullReset();
        this.setFatherName(fatherName);

        if (gender) {
            this.setGender(gender);
        }

        return this.getFatherNameCase(CaseNumber);
    }

    /**
     * Inflects the current words in all cases and formats the word according to the `format` template.
     * 
     * **Format:**
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     * 
     * @param string format A template "S N F" | "N S F" | "N S"
     * @return array An array with all cases
     */
    getFormattedArray(format) {
        if (Array.isArray(format)) {
            return this.getFormattedArrayHard(format);
        }

        var length = format.length;
        var result = [];
        var cases = {};

        cases['S'] = this.getCasesConnected(index['S']);
        cases['N'] = this.getCasesConnected(index['N']);
        cases['F'] = this.getCasesConnected(index['F']);

        for (var curCase = 0; curCase < this.CaseCount; curCase++) {
            var line = '';

            for (var i = 0; i < length; i++) {
                var symbol = format.substring(i, i + 1);

                if (symbol == 'S') {
                    line += cases['S'][curCase];
                } else if (symbol == 'N') {
                    line += cases['N'][curCase];
                } else if (symbol == 'F') {
                    line += cases['F'][curCase];
                } else {
                    line += symbol;
                }
            }

            result.push(line);
        }

        return result;
    }

    /**
     * Inflects the current words in all cases and formats the word according to the `format` template.
     * 
     * **Format:**
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     * 
     * @param array format An array with format template
     * @return array An array with formatted anthroponym
     */
    getFormattedArrayHard(format) {
        var result = [];
        var cases = [];

        for (var word of format) {
            cases.push(word.getNameCases());
        }

        for (var curCase = 0; curCase < this.CaseCount; curCase++) {
            var line = '';

            for (var value of cases) {
                line += value[curCase] + ' ';
            }

            result.push(line.trim());
        }

        return result;
    }

    /**
     * Inflects the current words by the `caseNum` and formats the word according to the `format` templates.
     * 
     * **Format:**
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     * 
     * @param int caseNum Case number
     * @param array format An array with format template
     * @return string A formatted anthroponym
     */
    getFormattedHard(caseNum = 0, format = []) {
        var result = '';

        for (var word of format) {
            var cases = word.getNameCases();
            result += cases[caseNum] + ' ';
        }

        return result.trim();
    };

    /**
     * Inflects the current words by the `caseNum` and formats the word according to the `format` template.
     * 
     * **Format:**
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     * 
     * @param int caseNum Case number
     * @param string format A template "S N F" | "N S F" | "N S"
     * @return string A formatted anthroponym
     */
    getFormatted(caseNum = 0, format = 'S N F') {
        this.AllWordCases();

        // If the case is not specified, then use the another method
        if (caseNum == null || !caseNum) {
            return this.getFormattedArray(format);
        }

        // If format is complicated
        else if (Array.isArray(format)) {

            return this.getFormattedHard(caseNum, format);

        } else {
            var length = format.length;
            var result = '';

            for (var i = 0; i < length; i++) {
                var symbol = format.slice(i, i + 1);

                if (symbol == 'S') {
                    result += this.getSecondNameCase(caseNum);
                } else if (symbol == 'N') {
                    result += this.getFirstNameCase(caseNum);
                } else if (symbol == 'F') {
                    result += this.getFatherNameCase(caseNum);
                } else {
                    result += symbol;
                }
            }
            return result;
        }
    }

    /**
     * Inflects the anthroponym according to the `caseNum`, `gender`, and its type returning
     * the formatted anthroponym by specified `format`.
     * 
     * **Format:**
     * - S - Surname (Second Name)
     * - N - Name (First Name)
     * - F - Father's Name (Patronymic)
     * 
     * @param string secondName Second Name
     * @param string firstName First Name
     * @param string fatherName Patronymic
     * @param int gender Genus
     * @param int caseNum Case number
     * @param string format A template "S N F" | "N S F" | "N S"
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see setFirstName
     * @see setSecondName
     * @see setFatherName
     * @see setGender
     * @see getFormatted
     */
    qFullName(secondName = '', firstName = '', fatherName = '', gender = 0, caseNum = 0, format = 'S N F') {
        this.fullReset();
        this.setFirstName(firstName);
        this.setSecondName(secondName);
        this.setFatherName(fatherName);

        if (gender) {
            this.setGender(gender);
        }

        return this.getFormatted(caseNum, format);
    }

    /**
     * Inflects the anthroponym based on the specified `caseNum`, `gender`, and type, while preserving
     * the original ordering.
     * 
     * @param string fullname "SecondName FirstName Patronymic"
     * @param int caseNum Case number
     * @param int gender Genus
     * @return mixed An array or a string with the necessary inflected case
     * 
     * @see splitFullName
     * @see setGender
     * @see getFormatted
     */
    q(fullname, caseNum = null, gender = null) {
        this.fullReset();
        var format = this.splitFullName(fullname);
        if (gender) {
            this.setGender(gender);
        }

        return this.getFormatted(caseNum, format);
    }

    /**
     * Determines the genus according to the specified `fullname`.
     * 
     * @param string fullname "SecondName FirstName Patronymic"
     * @return int The Genus
     */
    genderDetect(fullname) {
        this.fullReset();
        this.splitFullName(fullname);

        return this.genderAutoDetect();
    }

    /**
     * Returns the private internal attribute `this.words`.
     * @return array An array of NCLNameCaseWord
     */
    getWordsArray() {
        return this.words;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the male name.
     * 
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    manFirstName() {
        return false;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the female name.
     * 
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    womanFirstName() {
        return false;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the male surname.
     * 
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    manSecondName() {
        return false;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the female surname.
     * 
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    womanSecondName() {
        return false;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the male patronymic.
     * 
     * @return boolean true - if the word was successfully inflected; false - otherwise
     */
    manFatherName() {
        return false;
    }

    /**
     * A language's child class method.
     * Attempts to apply a sequence of rules for the female patronymic.
     * 
     * @return boolean true - if the word was successfully inflected; false - otherwise
     */
    womanFatherName() {
        return false;
    }

    /**
     * A language's child class method.
     * Determination of gender according to the rules of names.
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring gender determination
     */
    GenderByFirstName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }
    }

    /**
     * A language's child class method.
     * Determination of gender according to the rules of surname.
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring gender determination
     */
    GenderBySecondName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }
    }

    /**
     * A language's child class method.
     * Determination of gender according to the rules of patronymic.
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring gender determination
     */
    GenderByFatherName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }
    }

    /**
     * A language's child class method.
     * Analyzing the `word` and determining its anthroponym by Name, Surname, and Patronymic.
     * - **N** - Name (First Name)
     * - **S** - Surname (Second Name)
     * - **F** - Father's Name (Patronymic)
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring determination
     */
    detectNamePart(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }
    }

    /**
     * Returns the version of the library.
     * @return string the version of the library
     */
    version() {
        return this._version;
    }

    /**
     * Returns the version of the used language file.
     * @return string Version of the language file
     */
    languageVersion() {
        return this._languageBuild;
    }
}

module.exports = NCLNameCaseCore;
