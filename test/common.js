global.expect = require('expect');
global.createSpy = expect.createSpy
global.spyOn = expect.spyOn
global.isSpy = expect.isSpy

global.createSpyObjectWith = require('./test_utils/spy-obj');
global.matchers = require('./test_utils/matchers');
global.MockDomNode = require('./test_utils/MockDomNode');
require('./test_utils/expectations');
