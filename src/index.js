'use strict';

const NCLNameCaseUa = require('./NCLNameCaseUa.js');
const NCLNameCaseRu = require('./NCLNameCaseRu.js');
const NCL = require('./NCL/NCL.js');

NCL.setConcreteClasses({
    ru: NCLNameCaseRu,
    ua: NCLNameCaseUa,
});

module.exports = {
    NCLNameCaseUa,
    NCLNameCaseRu,
    NCL
};
