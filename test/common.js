global.expect = require('expect');
global.createSpy = expect.createSpy
global.spyOn = expect.spyOn
global.isSpy = expect.isSpy

global.createSpyObjectWith = require('./utils/spy-obj');
global.matchers = require('./utils/matchers');
global.MockDomNode = require('./utils/MockDomNode');
require('./utils/expectations');
