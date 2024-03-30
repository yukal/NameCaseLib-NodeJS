/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

const NCLNameCaseCore = require('./NCL/NCLNameCaseCore.js');
const NCLNameCaseWord = require('./NCL/NCLNameCaseWord.js');
const NCLStr = require('./NCL/NCLStr.js');

const math_min = require('locutus/php/math/min');
const math_max = require('locutus/php/math/max');

/**
 * **NCL NameCase Russian Language**
 * 
 * The declension rules of the Russian anthroponyms (Name, Surname, Patronymic).
 * The rules for determining a person's gender by their full name for the Russian language.
 * System of separation of surnames, names, and patronymics for the Russian language.
 * 
 * @author Andriy Chaika <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
class NCLNameCaseRu extends NCLNameCaseCore {
    constructor() {
        super();

        /**
         * Language file version
         * @var string
         */
        this._languageBuild = '11072716';

        /**
         * The number of cases in the language
         * @var int
         */
        this.CaseCount = 6;

        /**
         * Vowel Sounds
         * @var string
         */
        this.vowels = 'аеёиоуыэюя';

        /**
         * Consonant Sounds
         * @var string
         */
        this.consonant = 'бвгджзйклмнпрстфхцчшщ';

        /**
         * Endings of names/surnames that are not inflected
         * @var array
         */
        this.ovo = ['ово', 'аго', 'яго', 'ирь'];

        /**
         * Endings of names/surnames that are not inflected
         * @var array
         */
        this.ih = ['их', 'ых', 'ко', 'уа' /*Бенуа, Франсуа*/];

        /**
         * List of endings typical for surnames
         * According to the pattern {letter}* where * is any character except those in {exclude}
         * @var array of {letter}=>{exclude}
         */
        this.splitSecondExclude = {
            'а': 'взйкмнпрстфя',
            'б': 'а',
            'в': 'аь',
            'г': 'а',
            'д': 'ар',
            'е': 'бвгдйлмня',
            'ё': 'бвгдйлмня',
            'ж': '',
            'з': 'а',
            'и': 'гдйклмнопрсфя',
            'й': 'ля',
            'к': 'аст',
            'л': 'аилоья',
            'м': 'аип',
            'н': 'ат',
            'о': 'вдлнпря',
            'п': 'п',
            'р': 'адикпть',
            'с': 'атуя',
            'т': 'аор',
            'у': 'дмр',
            'ф': 'аь',
            'х': 'а',
            'ц': 'а',
            'ч': '',
            'ш': 'а',
            'щ': '',
            'ъ': '',
            'ы': 'дн',
            'ь': 'я',
            'э': '',
            'ю': '',
            'я': 'нс'
        };

        this.names_man = [
            'Вова', 'Анри', 'Питер', 'Пауль', 'Франц', 'Вильям', 'Уильям',
            'Альфонс', 'Ганс', 'Франс', 'Филиппо', 'Андреа', 'Корнелис', 'Фрэнк', 'Леонардо',
            'Джеймс', 'Отто', 'жан-пьер', 'Джованни', 'Джозеф', 'Педро', 'Адольф', 'Уолтер',
            'Антонио', 'Якоб', 'Эсташ', 'Адрианс', 'Франческо', 'Доменико', 'Ханс', 'Гун',
            'Шарль', 'Хендрик', 'Амброзиус', 'Таддео', 'Фердинанд', 'Джошуа', 'Изак', 'Иоганн',
            'Фридрих', 'Эмиль', 'Умберто', 'Франсуа', 'Ян', 'Эрнст', 'Георг', 'Карл'
        ];
    }

    /**
     * Masculine names ending in any `ь` and `-й` decline like regular masculine nouns.
     * @return bool true if the rule was applied and false otherwise
     */
    manRule1() {
        if (this.in(this.Last(1), 'ьй')) {
            if (this.inNames(this.workingWord, ['Дель'])) {
                this.Rule(101);
                this.makeResultTheSame();

                return true;
            }

            if (this.Last(2, 1) != 'и') {

                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'е'], 1);
                this.Rule(102);

                return true;

            } else {

                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'и'], 1);
                this.Rule(103);

                return true;
            }
        }

        return false;
    }

    /**
     * Masculine names ending in any hard consonant decline like regular masculine nouns.
     * @return bool true if the rule was applied and false otherwise
     */
    manRule2() {
        if (this.in(this.Last(1), this.consonant)) {
            if (this.inNames(this.workingWord, 'Павел')) {

                this.lastResult = ['Павел', 'Павла', 'Павлу', 'Павла', 'Павлом', 'Павле'];
                this.Rule(201);

                return true;

            } else if (this.inNames(this.workingWord, 'Лев')) {

                this.lastResult = ['Лев', 'Льва', 'Льву', 'Льва', 'Львом', 'Льве'];
                this.Rule(202);

                return true;

            } else if (this.inNames(this.workingWord, 'ван')) {

                this.Rule(203);
                this.makeResultTheSame();

                return true;

            } else {

                this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
                this.Rule(204);

                return true;

            }
        }

        return false;
    }

    /**
     * Masculine and feminine names ending in `-а` decline like nouns with the same ending.
     * Masculine and feminine names ending in `-я`, `-ья`, `-ия`, `-ея`, regardless of their language
     * of origin, decline like nouns with corresponding endings.
     * 
     * @return bool true if the rule was applied and false otherwise
     */
    manRule3() {
        if (this.Last(1) == 'а') {
            if (this.inNames(this.workingWord, ['фра', 'Дега', 'Андреа', 'Сёра', 'Сера'])) {

                this.Rule(301);
                this.makeResultTheSame();

                return true;

            } else if (!this.in(this.Last(2, 1), 'кшгх')) {

                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(302);

                return true;

            } else {

                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(303);

                return true;

            }
        } else if (this.Last(1) == 'я') {

            this.wordForms(this.workingWord, ['и', 'е', 'ю', 'ей', 'е'], 1);
            this.Rule(303);

            return true;

        }

        return false;
    }

    /**
     * Masculine surnames ending in `-ь` and `-й` decline like regular masculine nouns.
     * @return bool true if the rule was applied and false otherwise
     */
    manRule4() {
        if (this.in(this.Last(1), 'ьй')) {
            // Words like "Воробей" (Sparrow)
            if (this.Last(3) == 'бей') {

                this.wordForms(this.workingWord, ['ья', 'ью', 'ья', 'ьем', 'ье'], 2);
                this.Rule(400);

                return true;

            } else if (this.Last(3, 1) == 'а' || this.in(this.Last(2, 1), 'ел')) {

                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'е'], 1);
                this.Rule(401);

                return true;

            } else if (this.Last(2, 1) == 'ы' || this.Last(3, 1) == 'т') {

                // "Толстой" -» "ТолстЫм"
                this.wordForms(this.workingWord, ['ого', 'ому', 'ого', 'ым', 'ом'], 2);
                this.Rule(402);

                return true;

            } else if (this.Last(3) == 'чий') {

                // "Лесничий"
                this.wordForms(this.workingWord, ['ьего', 'ьему', 'ьего', 'ьим', 'ьем'], 2);
                this.Rule(403);

                return true;

            } else if (!this.in(this.Last(2, 1), this.vowels) || this.Last(2, 1) == 'и') {

                this.wordForms(this.workingWord, ['ого', 'ому', 'ого', 'им', 'ом'], 2);
                this.Rule(404);

                return true;

            } else {

                this.makeResultTheSame();
                this.Rule(405);

                return true;

            }
        }

        return false;
    }

    /**
     * Masculine surnames ending in `-к`.
     * @return bool true if the rule was applied and false otherwise
     */
    manRule5() {
        if (this.Last(1) == 'к') {
            // If the word ends with "ok", then "o" must be removed
            if (this.Last(4) == 'енок' || this.Last(4) == 'ёнок') { // "Поллок"

                this.wordForms(this.workingWord, ['ка', 'ку', 'ка', 'ком', 'ке'], 2);
                this.Rule(501);

                return true;

            }

            if (this.Last(2, 1) == 'е' && !in_array(this.Last(3, 1), ['р'])) { // "Лотрек"

                this.wordForms(this.workingWord, ['ька', 'ьку', 'ька', 'ьком', 'ьке'], 2);
                this.Rule(502);

                return true;

            } else {

                this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
                this.Rule(503);

                return true;

            }
        }

        return false;
    }

    /**
     * Masculine surnames ending in a consonant take the endings `ем`/`ом`/`ым`.
     * @return bool true if the rule was applied and false otherwise
     */
    manRule6() {
        if (this.Last(1) == 'ч') {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ем', 'е']);
            this.Rule(601);

            return true;

        } else if (this.Last(2) == 'ец') {

            // dropps "е" before "ц"
            this.wordForms(this.workingWord, ['ца', 'цу', 'ца', 'цом', 'це'], 2);
            this.Rule(604);

            return true;

        } else if (this.in(this.Last(1), 'цсршмхт')) {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
            this.Rule(602);

            return true;

        } else if (this.in(this.Last(1), this.consonant)) {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ым', 'е']);
            this.Rule(603);

            return true;

        }

        return false;
    }

    /**
     * Masculine patronymics ending in `-а` `-я`.
     * @return bool true - if the rule was used; false - otherwise
     */
    manRule7() {
        if (this.Last(1) == 'а') {
            if (this.inNames(this.workingWord, ['да'])) {

                this.Rule(701);
                this.makeResultTheSame();

                return true;

            }

            if (this.Last(2, 1) == 'ш') {

                // If the stem is in "ш", then use "и", "ей"
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                this.Rule(702);

                return true;

            } else if (this.in(this.Last(2, 1), 'хкг')) {

                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(703);

                return true;

            } else {

                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(704);

                return true;

            }
        } else if (this.Last(1) == 'я') {

            this.wordForms(this.workingWord, ['ой', 'ой', 'ую', 'ой', 'ой'], 2);
            this.Rule(705);

            return true;

        }

        return false;
    }

    /**
     * Masculine surnames do not undergo declension.
     * @return bool true if the rule was applied; false otherwise
     */
    manRule8() {
        if (this.in(this.Last(3), this.ovo) || this.in(this.Last(2), this.ih)) {
            if (this.inNames(this.workingWord, ['рерих'])) {
                return false;
            }

            this.Rule(8);
            this.makeResultTheSame();

            return true;
        }

        return false;
    }

    /**
     * Masculine and feminine names ending in `-а` decline like any nouns with the same ending.
     * @return true if the rule was applied; false otherwise
     */
    womanRule1() {
        if (this.Last(1) == 'а' && this.Last(2, 1) != 'и') {
            if (!this.in(this.Last(2, 1), 'шхкг')) {

                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(101);

                return true;

            } else {
                // "ей" after the sibilant
                if (this.Last(2, 1) == 'ш') {

                    this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                    this.Rule(102);

                    return true;

                } else {

                    this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                    this.Rule(103);

                    return true;

                }
            }
        }

        return false;
    }

    /**
     * Masculine and feminine names ending in `-я`, `-ья`, `-ия`, `-ея`, regardless of the language
     * they come from, decline like nouns with the corresponding endings.
     * 
     * @return true if the rule was applied; false otherwise
     */
    womanRule2() {
        if (this.Last(1) == 'я') {
            if (this.Last(2, 1) != 'и') {

                this.wordForms(this.workingWord, ['и', 'е', 'ю', 'ей', 'е'], 1);
                this.Rule(201);

                return true;

            } else {

                this.wordForms(this.workingWord, ['и', 'и', 'ю', 'ей', 'и'], 1);
                this.Rule(202);

                return true;

            }
        }

        return false;
    }

    /**
     * Russian feminine names ending in a soft consonant decline like nouns of the feminine gender,
     * such as "дочь" (daughter), "тень" (shadow).
     * 
     * @return true if the rule was applied; false otherwise
     */
    womanRule3() {
        if (this.Last(1) == 'ь') {

            this.wordForms(this.workingWord, ['и', 'и', 'ь', 'ью', 'и'], 1);
            this.Rule(3);

            return true;

        }

        return false;
    }

    /**
     * Feminine surnames ending in `-а` or `-я` decline like nouns with the same ending.
     * @return true if the rule was applied; false otherwise
     */
    womanRule4() {
        if (this.Last(1) == 'а') {
            if (this.in(this.Last(2, 1), 'гк')) {

                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(401);

                return true;

            } else if (this.in(this.Last(2, 1), 'ш')) {

                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                this.Rule(402);

                return true;

            } else {

                this.wordForms(this.workingWord, ['ой', 'ой', 'у', 'ой', 'ой'], 1);
                this.Rule(403);

                return true;

            }
        } else if (this.Last(1) == 'я') {

            this.wordForms(this.workingWord, ['ой', 'ой', 'ую', 'ой', 'ой'], 2);
            this.Rule(404);

            return true;

        }

        return false;
    }

    /**
     * Attempts to apply a sequence of rules for the male name.
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    manFirstName() {
        if (this.inNames(this.workingWord, ['Старший', 'Младший'])) {
            this.wordForms(this.workingWord, ['его', 'ему', 'его', 'им', 'ем'], 2);
            return true;
        }

        if (this.inNames(this.workingWord, ['Мариа'])) {
            // "Альфонс" / "Мария" / "Муха"
            this.wordForms(this.workingWord, ['и', 'и', 'ю', 'ей', 'ии'], 1);
            return true;
        }

        return this.RulesChain('man', [1, 2, 3]);
    }

    /**
     * Attempts to apply a sequence of rules for the female name.
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    womanFirstName() {
        return this.RulesChain('woman', [1, 2, 3]);
    }

    /**
     * Attempts to apply a sequence of rules for the male surname.
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    manSecondName() {
        return this.RulesChain('man', [8, 4, 5, 6, 7]);
    }

    /**
     * Attempts to apply a sequence of rules for the female surname.
     * @return boolean true - if the rule from the list was used, false - if the rule was not found
     */
    womanSecondName() {
        return this.RulesChain('woman', [4]);
    }

    /**
     * Inflects the patronymic of male anthroponym.
     * @return boolean True - if the word was successfully inflected; false - otherwise
     */
    manFatherName() {
        // Check is it a patronymic anthroponym
        if (this.inNames(this.workingWord, 'Ильич')) {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
            return true;

        } else if (this.Last(2) == 'ич') {

            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ем', 'е']);
            return true;

        }

        return false;
    }

    /**
     * Inflects the patronymic of female anthroponym.
     * @return boolean True - if the word was successfully inflected; false - otherwise
     */
    womanFatherName() {
        // Check is it a patronymic anthroponym
        if (this.Last(2) == 'на') {

            this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
            return true;

        }

        return false;
    }

    /**
     * Determination of gender, according to the rules of the name.
     * @param NCLNameCaseWord word An object with the word for which itʼs necessary to determine the gender
     */
    GenderByFirstName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        this.setWorkingWord(word.getWord());

        var man = 0;
        var woman = 0;

        // Try to find the maximum info out of the name
        // If the name ends in "й", it is most likely a masculine

        if (this.Last(1) == 'й') {
            man += 0.9;
        }

        if (this.in(this.Last(2), ['он', 'ов', 'ав', 'ам', 'ол', 'ан', 'рд', 'мп', 'по' /*Филиппо*/, 'до' /*Леонардо*/, 'др', 'рт'])) {
            man += 0.3;
        }

        if (this.in(this.Last(1), this.consonant)) {
            man += 0.01;
        }

        if (this.Last(1) == 'ь') {
            man += 0.02;
        }

        if (this.in(this.Last(2), ['вь', 'фь', 'ль', 'на'])) {
            woman += 0.1;
        }

        if (this.in(this.Last(2), ['ла'])) {
            woman += 0.04;
        }

        if (this.in(this.Last(2), ['то', 'ма'])) {
            man += 0.01;
        }

        if (this.in(this.Last(3), ['лья', 'вва', 'ока', 'ука', 'ита', 'эль' /*Рафаэль, Габриэль*/, 'реа' /*Андреа*/])) {
            man += 0.2;
        }

        if (this.in(this.Last(3), ['има'])) {
            woman += 0.15;
        }

        if (this.in(this.Last(3), ['лия', 'ния', 'сия', 'дра', 'лла', 'кла', 'опа', 'вия'])) {
            woman += 0.5;
        }

        if (this.in(this.Last(4), ['льда', 'фира', 'нина', 'лита', 'алья'])) {
            woman += 0.5;
        }

        if (this.inNames(this.workingWord, this.names_man)) {
            man += 10;
        }

        if (this.inNames(this.workingWord, ['Бриджет', 'Элизабет', 'Маргарет', 'Джанет', 'Жаклин', 'Эвелин'])) {
            woman += 10;
        }

        // The exception is for "Берил Кук", who is a woman
        if (this.inNames(this.workingWord, ['Берил'])) {
            woman += 0.05;
        }

        word.setGender(man, woman);
    }

    /**
     * Determination of gender, according to the rules of the surname.
     * @param NCLNameCaseWord word An object with the word for which itʼs necessary to determine the gender
     */
    GenderBySecondName(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        this.setWorkingWord(word.getWord());

        var man = 0;
        var woman = 0;

        if (this.in(this.Last(2), ['ов', 'ин', 'ев', 'ий', 'ёв', 'ый', 'ын', 'ой'])) {
            man += 0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ина', 'ева', 'ёва', 'ына', 'мин'])) {
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
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

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
     * - **F** - Father's Name (Patronymic)
     * 
     * @param NCLNameCaseWord word An object belonging to the class of words requiring determination
     */
    detectNamePart(/*NCLNameCaseWord*/ word) {
        if (!(word instanceof NCLNameCaseWord)) {
            throw new Error(`word should be of class NCLNameCaseWord`);
        }

        var namepart = word.getWord();
        var length = NCLStr.strlen(namepart);
        this.setWorkingWord(namepart);

        // Compute the probability of coincidence
        var first = 0;
        var second = 0;
        var father = 0;

        // similar to a patronymic anthroponym
        if (this.in(this.Last(3), ['вна', 'чна', 'вич', 'ьич'])) {
            father += 3;
        }

        if (this.in(this.Last(2), ['ша'])) {
            first += 0.5;
        }

        if (this.in(this.Last(3), ['эль' /*Рафаэль, Габриэль*/])) {
            first += 0.5;
        }

        // Letters that names never end with
        if (this.in(this.Last(1), 'еёжхцочшщъыэю')) {
            // exceptions
            if (this.inNames(namepart, ['Мауриц'])) {
                first += 10;
            } else {
                second += 0.3;
            }
        }

        // Use an array of specific endings
        if ((this.splitSecondExclude[this.Last(2, 1)])) {
            if (!this.in(this.Last(1), this.splitSecondExclude[this.Last(2, 1)])) {
                second += 0.4;
            }
        }

        // Abbreviated affectionate names such as "Аня", "Галя", etc.
        if (this.Last(1) == 'я' && this.in(this.Last(3, 1), this.vowels)) {
            first += 0.5;
        }

        // There are no names ending with such penultimate letters.
        if (this.in(this.Last(2, 1), 'жчщъэю')) {
            second += 0.3;
        }

        // Words ending with a soft sign "ь". There are very few names ending with a soft sign.
        // Everything else is a surname.

        if (this.Last(1) == 'ь') {
            // Names like "нинЕЛь" "адЕЛь" "асЕЛь"
            if (this.Last(3, 2) == 'ел') {
                first += 0.7;
            }

            // Simply exceptions
            else if (this.inNames(namepart, ['Лазарь', 'Игорь', 'Любовь'])) {
                first += 10;
            }

            // Otherwise, it's a surname
            else {
                second += 0.3;
            }
        }

        // If the last two letters are consonants, it's most likely a surname
        else if (this.in(this.Last(1), this.consonant + '' + 'ь') && this.in(this.Last(2, 1), this.consonant + '' + 'ь')) {
            // Almost all except those ending with the following letter combinations

            if (!this.in(this.Last(2), ['др', 'кт', 'лл', 'пп', 'рд', 'рк', 'рп', 'рт', 'тр'])) {
                second += 0.25;
            }
        }

        // Words ending with "тин"
        if (this.Last(3) == 'тин' && this.in(this.Last(4, 1), 'нст')) {
            first += 0.5;
        }

        // Exceptions
        if (this.inNames(namepart, [
            'Лев', 'Яков', 'Вова', 'Маша', 'Ольга', 'Еремей',
            'Исак', 'Исаак', 'Ева', 'Ирина', 'Элькин', 'Мерлин', 'Макс', 'Алекс',
            'Мариа', // Альфонс Мариа Муха

            // female foreign names
            'Бриджет', 'Элизабет', 'Маргарет', 'Джанет', 'Жаклин', 'Эвелин'
        ]) || this.inNames(namepart, this.names_man)) {
            first += 10;
        }

        // Surnames ending with "-ли" except for those like "натАли" and similar.
        if (this.Last(2) == 'ли' && this.Last(3, 1) != 'а') {
            second += 0.4;
        }

        // Surnames ending with "-як", except for those like "Касьян", "Куприян" + "Ян" and so on.
        if (this.Last(2) == 'ян' && length > 2 && !this.in(this.Last(3, 1), 'ьи')) {
            second += 0.4;
        }

        // Surnames ending with "-ур", except for names like "Артур", "Тимур"
        if (this.Last(2) == 'ур') {
            if (!this.inNames(namepart, ['Артур', 'Тимур'])) {
                second += 0.4;
            }
        }

        // Analysis of diminutive names ending with "-ик"
        if (this.Last(2) == 'ик') {
            // Affectionate letters before "ик"
            if (this.in(this.Last(3, 1), 'лшхд')) {
                first += 0.3;
            } else {
                second += 0.4;
            }
        }

        // Analysis of names and surnames ending with "-ина"
        if (this.Last(3) == 'ина') {
            // All similar to "Катерина" and "Кристина"

            if (this.in(this.Last(7), ['атерина', 'ристина'])) {
                first += 10;
            }

            // Exceptions
            else if (this.inNames(namepart, ['Мальвина', 'Антонина', 'Альбина', 'Агриппина', 'Фаина', 'Карина', 'Марина', 'Валентина', 'Калина', 'Аделина', 'Алина', 'Ангелина', 'Галина', 'Каролина', 'Павлина', 'Полина', 'Элина', 'Мина', 'Нина', 'Дина'])) {
                first += 10;
            }

            // Otherwise, it's a surname
            else {
                second += 0.4;
            }
        }

        // Names like "Николай"
        if (this.Last(4) == 'олай') {
            first += 0.6;
        }

        // Surname endings
        if (this.in(this.Last(2), ['ов', 'ин', 'ев', 'ёв', 'ый', 'ын', 'ой', 'ук', 'як', 'ца', 'ун', 'ок', 'ая', 'ёк', 'ив', 'ус', 'ак', 'яр', 'уз', 'ах', 'ай'])) {
            second += 0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ева', 'ёва', 'ына', 'шен', 'мей', 'вка', 'шир', 'бан', 'чий', 'кий', 'бей', 'чан', 'ган', 'ким', 'кан', 'мар', 'лис'])) {
            second += 0.4;
        }

        if (this.in(this.Last(4), ['шена'])) {
            second += 0.4;
        }

        // Exceptions and particles
        if (this.inNames(namepart, ['да', 'валадон', 'Данбар'])) {
            second += 10;
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

module.exports = NCLNameCaseRu;
