/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

/**
 * A class that contains the main library constants:
 * - male and female genus indices
 * - indices of all cases
 * 
 * @author Andriy Chaika <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCL {
    /**
     * Masculine gender
     * @static integer
     */
    static get MAN() { return 1; }

    /**
     * Feminine gender
     * @static integer
     */
    static get WOMAN() { return 2; }

    /**
     * Nominative case
     * @static integer
     */
    static get IMENITLN() { return 0; }

    /**
     * Genitive case
     * @static integer
     */
    static get RODITLN() { return 1; }

    /**
     * Dative case
     * @static integer
     */
    static get DATELN() { return 2; }

    /**
     * Accusative case
     * @static integer
     */
    static get VINITELN() { return 3; }

    /**
     * Instrumental case
     * @static integer
     */
    static get TVORITELN() { return 4; }

    /**
     * Prepositional case
     * @static integer
     */
    static get PREDLOGN() { return 5; }

    /**
     * Nominative case
     * @static integer
     */
    static get UaNazyvnyi() { return 0; }

    /**
     * Genitive case
     * @static integer
     */
    static get UaRodovyi() { return 1; }

    /**
     * Dative case
     * @static integer
     */
    static get UaDavalnyi() { return 2; }

    /**
     * Accusative case
     * @static integer
     */
    static get UaZnahidnyi() { return 3; }

    /**
     * Instrumental case
     * @static integer
     */
    static get UaOrudnyi() { return 4; }

    /**
     * Locative case
     * @static integer
     */
    static get UaMiszevyi() { return 5; }

    /**
     * Vocative case
     * @static integer
     */
    static get UaKlychnyi() { return 6; }

    static getConcreteClass(lang) {
        return NCL._concreteClasses && NCL._concreteClasses[lang] ? NCL._concreteClasses[lang] : null;
    }

    static setConcreteClasses(concreteClasses) {
        NCL._concreteClasses = concreteClasses;
    }
}
