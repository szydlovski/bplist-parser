// test are adapted from https://github.com/joeferner/node-bplist-parser
// which in turn were adapted from https://github.com/TooTallNate/node-plist

import assert from 'assert';
import path from 'path';
import { readFileSync } from 'fs';
import { parseBplist } from '../build/index.js';

const buffers = Object.fromEntries(
	[
		'iTunes-small.bplist',
		'sample1.bplist',
		'sample2.bplist',
		'airplay.bplist',
		'utf16.bplist',
		'utf16_chinese.bplist',
		'uid.bplist',
		'int64.bplist',
	].map((filename) => {
		const buffer = readFileSync(path.join('test','files', filename));
		return [
			filename,
			buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength
			),
		];
	})
);

describe('bplist-parser', function () {
	it('iTunes Small', function () {
		const dict = parseBplist(buffers['iTunes-small.bplist']);
		assert.equal(dict['Application Version'], '9.0.3');
		assert.equal(dict['Library Persistent ID'], '6F81D37F95101437');
	});

	it('sample1', function () {
		const dict = parseBplist(buffers['sample1.bplist']);
		assert.equal(dict['CFBundleIdentifier'], 'com.apple.dictionary.MySample');
	});

	it('sample2', function () {
		const dict = parseBplist(buffers['sample2.bplist']);
		assert.equal(
			dict['PopupMenu'][2]['Key'],
			'\n        #import <Cocoa/Cocoa.h>\n\n#import <MacRuby/MacRuby.h>\n\nint main(int argc, char *argv[])\n{\n  return macruby_main("rb_main.rb", argc, argv);\n}\n'
		);
	});

	it('airplay', function () {
		const dict = parseBplist(buffers['airplay.bplist']);
		assert.equal(dict['duration'], 5555.0495000000001);
		assert.equal(dict['position'], 4.6269989039999997);
	});

	it('utf16', function () {
		const dict = parseBplist(buffers['utf16.bplist']);
		assert.equal(dict['CFBundleName'], 'sellStuff');
		assert.equal(dict['CFBundleShortVersionString'], '2.6.1');
		assert.equal(
			dict['NSHumanReadableCopyright'],
			'©2008-2012, sellStuff, Inc.'
		);
	});

	it('utf16chinese', function () {
		const dict = parseBplist(buffers['utf16_chinese.bplist']);
		assert.equal(dict['CFBundleName'], '天翼阅读');
		assert.equal(dict['CFBundleDisplayName'], '天翼阅读');
	});

	it('uid', function () {
		const dict = parseBplist(buffers['uid.bplist']);
		assert.deepEqual(dict['$objects'][1]['NS.keys'], [
			{ UID: 2 },
			{ UID: 3 },
			{ UID: 4 },
		]);
		assert.deepEqual(dict['$objects'][1]['NS.objects'], [
			{ UID: 5 },
			{ UID: 6 },
			{ UID: 7 },
		]);
		assert.deepEqual(dict['$top']['root'], { UID: 1 });
	});

	it('int64', function () {
		const dict = parseBplist(buffers['int64.bplist']);
		assert.equal(dict['zero'], '0');
		assert.equal(dict['int32item'], '1234567890');
		assert.equal(dict['int32itemsigned'], '-1234567890');
		assert.equal(dict['int64item'], '12345678901234567890');
	});
});

function extractArrayBuffer(buffer) {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength
	);
}
