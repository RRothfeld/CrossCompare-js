var chai = require('chai'),
		cc = require('../public/js/crosscompare');

var pos = function() { return Math.floor(Math.random() * 999) + 1; };
var neg = function() { return -pos(); };
var txt = function() { return 'abc' + pos(); };

describe('crosscompare', function() {

	it('should be defined', function () {
		chai.assert.isDefined(cc);
	});

	describe('default values', function () {
		it('should have a default height', function () {
			chai.assert.isAbove(cc.height, 0);
		});
		it('should have a default anchor', function () {
			chai.assert.isString(cc.anchor);
		});
		it('should have a default active flag', function () {
			chai.assert.isBoolean(cc.active);
		});
		it('should have no chart by default', function () {
			chai.expect(cc.chart).to.be.empty;
		});
		it('should have no added charts by default', function () {
			chai.expect(cc.charts).to.be.empty;
		});
	});

	describe('.setHeight()', function () {
		it('should accept positive integers', function () {
			var number = pos();
			cc.setHeight(number);
			chai.assert.equal(number, cc.height);
		});
		it('should accept zero', function () {
			cc.setHeight(0);
			chai.assert.equal(0, cc.height);
		});
		it('should ignore negative integers', function () {
			var unchanged = cc.height;
			var number = neg();
			cc.setHeight(number);
			chai.assert.equal(unchanged, cc.height);
		});
		it('should ignore non-integers', function () {
			var unchanged = cc.height;
			cc.setHeight('test');
			chai.assert.equal(unchanged, cc.height);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.height;
			cc.setHeight();
			chai.assert.equal(unchanged, cc.height);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setHeight());
			chai.assert.equal(cc, cc.setHeight(pos()));
			chai.assert.equal(cc, cc.setHeight(0));
			chai.assert.equal(cc, cc.setHeight(neg()));
		});
	});

	describe('.setAnchor()', function () {
		it('should accept String with 1 or more characters', function () {
			var text = txt();
			cc.setAnchor(text);
			chai.assert.equal(text, cc.anchor);

			var character = 'a';
			cc.setAnchor(character);
			chai.assert.equal(character, cc.anchor);
		});
		it('should ignore empty Strings', function () {
			var unchanged = cc.anchor;
			cc.setAnchor('');
			chai.assert.equal(unchanged, cc.anchor);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.anchor;
			cc.setAnchor();
			chai.assert.equal(unchanged, cc.anchor);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setAnchor());
			chai.assert.equal(cc, cc.setAnchor(''));
			chai.assert.equal(cc, cc.setAnchor('test'));
		});
	});
});