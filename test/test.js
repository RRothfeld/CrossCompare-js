var chai = require('chai'),
		cc = require('../crosscompare');

// Generate random, whole number between 0 and 1000
function pos() { return Math.floor(Math.random() * 1000); };
// Generate random, whole number between -1000 and 0
function neg() { return -pos(); };
// Generate semi-random string
function txt() { return 'abc' + pos(); };

// Test CrossCompare.js
describe('CrossCompare.js', function() {

	it('should be defined', function () {
		chai.assert.isDefined(cc);
	});

	describe('Required default values', function () {
		it('should have a default height', function () {
			chai.assert.isAbove(cc.height, 0);
		});
		it('should have a default anchor', function () {
			chai.assert.isString(cc.anchor);
		});
	});

	describe('Function .setHeight()', function () {
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
			cc.setHeight(txt());
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
			chai.assert.equal(cc, cc.setHeight(200));
		});
	});

	describe('Function .setWidth()', function () {
		it('should accept positive integers', function () {
			var number = pos();
			cc.setWidth(number);
			chai.assert.equal(number, cc.width);
		});
		it('should accept zero', function () {
			cc.setWidth(0);
			chai.assert.equal(0, cc.width);
		});
		it('should accept \'auto\'', function () {
			cc.setWidth('auto');
			chai.assert.equal('auto', cc.width);
		});
		it('should ignore negative integers', function () {
			var unchanged = cc.width;
			var number = neg();
			cc.setWidth(number);
			chai.assert.equal(unchanged, cc.width);
		});
		it('should ignore non-\'auto\' strings', function () {
			var unchanged = cc.width;
			cc.setWidth(txt());
			chai.assert.equal(unchanged, cc.width);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.width;
			cc.setWidth();
			chai.assert.equal(unchanged, cc.width);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setWidth());
			chai.assert.equal(cc, cc.setWidth(pos()));
			chai.assert.equal(cc, cc.setWidth(0));
			chai.assert.equal(cc, cc.setWidth(neg()));
			chai.assert.equal(cc, cc.setWidth(200));
		});
	});

	describe('Function .setPadding()', function () {
		it('should accept positive integers', function () {
			var a = pos(),
					b = pos(),
					c = pos(),
					d = pos();
			cc.setPadding(a, b, c, d);
			chai.assert.equal(a, cc.padding.top);
			chai.assert.equal(b, cc.padding.right);
			chai.assert.equal(c, cc.padding.bottom);
			chai.assert.equal(d, cc.padding.left);
		});
		it('should accept zero', function () {
			cc.setPadding(0, 0, 0, 0);
			chai.assert.equal(0, cc.padding.top);
			chai.assert.equal(0, cc.padding.right);
			chai.assert.equal(0, cc.padding.bottom);
			chai.assert.equal(0, cc.padding.left);
		});
		it('should accept negative integers', function () {
			var a = neg(),
					b = neg(),
					c = neg(),
					d = neg();
			cc.setPadding(a, b, c, d);
			chai.assert.equal(a, cc.padding.top);
			chai.assert.equal(b, cc.padding.right);
			chai.assert.equal(c, cc.padding.bottom);
			chai.assert.equal(d, cc.padding.left);
		});
		it('should ignore non-integers', function () {
			var unchanged = cc.padding;
			cc.setPadding(txt(),neg(),pos(),txt());
			chai.assert.equal(unchanged, cc.padding);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.padding;
			cc.setPadding();
			chai.assert.equal(unchanged, cc.padding);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setPadding());
			chai.assert.equal(cc, cc.setPadding(pos(), pos(), pos(), pos()));
			chai.assert.equal(cc, cc.setPadding(neg(), neg(), neg(), neg()));
			chai.assert.equal(cc, cc.setPadding(0, 0, 0, 0));
		});
	});

	describe('Function .setAnchor()', function () {
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
			chai.assert.equal(cc, cc.setAnchor(txt()));
		});
	});

	describe('Function .setDateFormat()', function () {
		it('should accept String with 1 or more characters', function () {
			var text = txt();
			cc.setDateFormat(text);
			chai.assert.equal(text, cc.dateFormat);

			var character = 'a';
			cc.setDateFormat(character);
			chai.assert.equal(character, cc.dateFormat);
		});
		it('should ignore empty Strings', function () {
			var unchanged = cc.dateFormat;
			cc.setDateFormat('');
			chai.assert.equal(unchanged, cc.dateFormat);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.dateFormat;
			cc.setDateFormat();
			chai.assert.equal(unchanged, cc.dateFormat);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setDateFormat());
			chai.assert.equal(cc, cc.setDateFormat(''));
			chai.assert.equal(cc, cc.setDateFormat(txt()));
		});
	});

	describe('Function .setGrid()', function () {
		it('should accept two booleans', function () {
			cc.setGrid(true, true);
			chai.assert.isTrue(cc.xGrid);
			chai.assert.isTrue(cc.yGrid);

			cc.setGrid(false, false);
			chai.assert.isFalse(cc.xGrid);
			chai.assert.isFalse(cc.yGrid);
		});
		it('should ignore one boolean', function () {
			var unchangedX = cc.xGrid;
			var unchangedY = cc.yGrid;
			cc.setGrid(false);
			chai.assert.equal(unchangedX, cc.xGrid);
			chai.assert.equal(unchangedX, cc.yGrid);
			cc.setGrid(true);
			chai.assert.equal(unchangedX, cc.xGrid);
			chai.assert.equal(unchangedX, cc.yGrid);
		});
		it('should ignore no parameter', function () {
			var unchangedX = cc.xGrid;
			var unchangedY = cc.yGrid;
			cc.setGrid();
			chai.assert.equal(unchangedX, cc.xGrid);
			chai.assert.equal(unchangedX, cc.yGrid);
		});
		it('should ignore non-boolean parameters', function () {
			var unchangedX = cc.xGrid;
			var unchangedY = cc.yGrid;
			cc.setGrid(pos(), txt());
			chai.assert.equal(unchangedX, cc.xGrid);
			chai.assert.equal(unchangedX, cc.yGrid);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setGrid(pos(), pos()));
			chai.assert.equal(cc, cc.setGrid());
			chai.assert.equal(cc, cc.setGrid(false, false));
		});
	});

	describe('Function .setFlash()', function () {
		it('should accept boolean', function () {
			cc.setFlash(true);
			chai.assert.isTrue(cc.flash);

			cc.setFlash(false);
			chai.assert.isFalse(cc.flash);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.flash;
			cc.setFlash();
			chai.assert.equal(unchanged, cc.flash);
		});
		it('should ignore non-boolean parameter', function () {
			var unchanged = cc.flash;
			cc.setFlash(pos());
			cc.setFlash(txt());
			chai.assert.equal(unchanged, cc.flash);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setFlash());
			chai.assert.equal(cc, cc.setFlash(true));
		});
	});

	describe('Function .addLegend()', function () {
		it('should accept object with title', function () {
			chai.assert.equal(0, cc.legends.length);
			cc.addLegend(txt(), txt());
			chai.assert.equal(1, cc.legends.length);
		});
		it('should accept object without title', function () {
			var previous = cc.legends.length;
			cc.addLegend(txt());
			chai.assert.equal(previous + 1, cc.legends.length);
		});
		it('should ignore no parameters', function () {
			var previous = cc.legends.length;
			cc.addLegend();
			chai.assert.equal(previous, cc.legends.length);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.addLegend());
			chai.assert.equal(cc, cc.addLegend(txt(), txt()));
			chai.assert.equal(cc, cc.addLegend(txt()));
		});
	});

	describe('Function .setOverwrite()', function () {
		it('should accept boolean', function () {
			cc.setOverwrite(true);
			chai.assert.isTrue(cc.overwrite);

			cc.setOverwrite(false);
			chai.assert.isFalse(cc.overwrite);
		});
		it('should ignore no parameter', function () {
			var unchanged = cc.overwrite;
			cc.setOverwrite();
			chai.assert.equal(unchanged, cc.overwrite);
		});
		it('should ignore non-boolean parameter', function () {
			var unchanged = cc.overwrite;
			cc.setOverwrite(pos());
			cc.setOverwrite(txt());
			chai.assert.equal(unchanged, cc.overwrite);
		});
		it('should be chain-able', function () {
			chai.assert.equal(cc, cc.setOverwrite());
			chai.assert.equal(cc, cc.setOverwrite(false));
		});
	});
});