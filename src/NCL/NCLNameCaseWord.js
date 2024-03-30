/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

import NCLStr from './NCLStr.js';
import NCL from './NCL.js';

var math_min = require('locutus/php/math/min');
var math_max = require('locutus/php/math/max');

/**
 * NCLNameCaseWord
 * A class that serves to store all information about each inflected word
 *
 * @author Andriy Chaika <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCLNameCaseWord {
    /**
     * Creating a new object with a specific `word`.
     * @param string word The input string
     */
    constructor(word) {
        /**
         * A lowercase word stored in an object
         * @var string
         */
        this.word = '';

        /**
         * An original word. The word that has been passed with the object creation and hasn't been changed
         * by the inflection process
         * 
         * @var string
         */
        this.word_orig = '';

        /**
         * Type of current record (Surname/First name/Patronymic)
         * - **S** - Surname (Second name)
         * - **N** - Name (First name)
         * - **F** - Patronymic (Father name)
         * 
         * @var string
         */
        this.namePart = null;

        /**
         * The rate indicating the likelihood that the current word is masculine.
         * @var int
         */
        this.genderMan = 0;

        /**
         * The rate indicating the likelihood that the current word is feminine.
         * @var int
         */
        this.genderWoman = 0;

        /**
         * The final determination of the gender to which the word belongs
         * - 0 - not determined
         * - NCL.MAN - masculine
         * - NCL.WOMAN - feminine
         * 
         * @var int
         */
        this.genderSolved = 0;

        /**
         * The mask representing the set of lowercase and uppercase letters in the word
         * - x - a  lowercase letter
         * - X - an uppercase letter
         * 
         * @var array
         */
        this.letterMask = [];

        /**
         * Contains true if the entire word is in uppercase, and false otherwise.
         * Default: false
         * 
         * @var bool
         */
        this.isUpperCase = false;

        /**
         * The array contains all the forms of the word obtained after inflecting the current word.
         * @var array
         */
        this.NameCases = [];

        /**
         * The number of the rule according to which the inflection of the current word was performed.
         * @var int
         */
        this.rule = 0;

        this.word_orig = word;
        this.generateMask(word);
        this.word = NCLStr.strtolower(word);
    }

    /**
     * Generate a mask that contains information about which letters in the word were uppercase and which were lowercase:
     * - x - a  lowercase letter
     * - X - an uppercase letter
     * @param string word The word for which to generate the mask
     */
    generateMask(word) {
        var letters = NCLStr.splitLetters(word);
        var mask = [];
        this.isUpperCase = true;

        for (var letter of letters) {
            if (NCLStr.isLowerCase(letter)) {

                mask.push('x');
                this.isUpperCase = false;

            } else {

                mask.push('X');

            }
        }

        this.letterMask = mask;
    }

    /**
     * Returns all word cases into the initial mask:
     * - x - a  lowercase letter
     * - X - an uppercase letter
     */
    returnMask() {
        if (this.isUpperCase) {

            for (var index in this.NameCases) {
                var kase = this.NameCases[index];
                this.NameCases[index] = NCLStr.strtoupper(this.NameCases[index]);
            }

        } else {

            var splitedMask = this.letterMask;
            var maskLength = splitedMask.length;

            for (var index in this.NameCases) {
                var kase = this.NameCases[index];
                var caseLength = NCLStr.strlen(kase);
                var max = math_min([caseLength, maskLength]);

                this.NameCases[index] = '';

                for (var letterIndex = 0; letterIndex < max; letterIndex++) {
                    var letter = NCLStr.substr(kase, letterIndex, 1);

                    if (splitedMask[letterIndex] == 'X') {
                        letter = NCLStr.strtoupper(letter);
                    }

                    this.NameCases[index] += letter;
                }

                this.NameCases[index] += NCLStr.substr(kase, max, caseLength - maskLength);
            }

        }
    }

    /**
     * Saves the inflection result of the current word.
     * @param array nameCases An array containing all the cases of the word
     */
    setNameCases(nameCases, is_return_mask = true) {
        this.NameCases = nameCases;
        if (is_return_mask) this.returnMask();
    }

    /**
     * Returns an array with all cases of the current word.
     * @return array An array with all cases
     */
    getNameCases() {
        return this.NameCases;
    }

    /**
     * Returns a string with the desired case of the current word.
     * @param int number The necessary case
     * @return string
     */
    getNameCase(number) {
        if (this.NameCases[number] != undefined) {
            return this.NameCases[number];
        }

        return false;
    }

    /**
     * Computes and returns the gender of the current word.
     * @return int
     */
    gender() {
        if (!this.genderSolved) {
            if (this.genderMan >= this.genderWoman) {
                this.genderSolved = NCL.MAN;
            } else {
                this.genderSolved = NCL.WOMAN;
            }
        }

        return this.genderSolved;
    }

    /**
     * Set both rates indicating the likelihood that the current word is masculine or feminine.
     * 
     * @param int man The rate indicating the likelihood that the current word is masculine
     * @param int woman The rate indicating the likelihood that the current word is feminine
     */
    setGender(man, woman) {
        this.genderMan = man;
        this.genderWoman = woman;
    }

    /**
     * Finally determines the genus
     * - 0 - not determined
     * - NCL.MAN - masculine
     * - NCL.WOMAN - feminine
     * 
     * @param int gender
     */
    setTrueGender(gender) {
        this.genderSolved = gender;
    }

    /**
     * Returns an array of the rate indicating the likelihood that a given word is masculine or feminine.
     * 
     * @return array An array with two records of
     * 
     * @see genderMan
     * @see genderWoman
     */
    getGender() {
        return { [NCL.MAN]: this.genderMan, [NCL.WOMAN]: this.genderWoman };
    }

    /**
     * Sets the type of the current word.
     * 
     * **Type of word:**
     * - S - Surname (Second name)
     * - N - Name (First name)
     * - F - Patronymic (Father name)
     * 
     * @param string namePart The anthroponym type
     */
    setNamePart(namePart) {
        this.namePart = namePart;
    }

    /**
     * Returns the type of the current word.
     * 
     * **Type of word:**
     * - S - Surname (Second name)
     * - N - Name (First name)
     * - F - Patronymic (Father name)
     * 
     * @return string namePart The anthroponym type
     */
    getNamePart() {
        return this.namePart;
    }

    /**
     * Returns the current word
     * @return string Current word
     */
    getWord() {
        return this.word;
    }

    /**
     * Returns the original word.
     * The word that has been passed with the object creation and hasn't been changed by the inflection process.
     * 
     * @return string Current word
     */
    getWordOrig() {
        return this.word_orig;
    }

    /**
     * If gender has been computed for all words, each word is assigned a final decision.
     * This function checks if a final decision has been made.
     * 
     * @return bool Whether a final decision has been made regarding the gender of the current word
     */
    isGenderSolved() {
        return (this.genderSolved ? true : false);
    }

    /**
     * Sets the rule number according to which the current word was inflected.
     * @param int ruleID The number of the rule
     */
    setRule(ruleID) {
        this.rule = ruleID;
    }
}
