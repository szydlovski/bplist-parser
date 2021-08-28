# bplist-parser

An isomorphic library for parsing MacOS `bplist` files.

# Usage
```bash
npm install @szydlovski/bplist-parser
```
```js
import { parseBplist } from '@szydlovski/bplist-parser';

// browser
(async () => {
  const response = await fetch('./Profile.bplist');
  const arrayBuffer = await response.arrayBuffer();
  const properties = parseBplist(arrayBuffer);
})();

// node
import { promises as fs } from 'fs';
(async () => {
  const buffer = await fs.readFile('./Profile.bplist');
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const properties = parseBplist(arrayBuffer);
})();
```

# API

## `parseBplist(data: ArrayBuffer, skipChecks = false)`

Arguments:
- data - `ArrayBuffer` - the file to be parsed
- skipChecks - `boolean` - whether the parser should skip checking the header, defaults to false

Returns the contents of the given `ArrayBuffer` parsed as a `bplist`. Usually a dictionary (plain object), but theoretically a `bplist` could also contain a single `boolean`, `number`, `string`, or even a `null`.

# License

MIT License

Copyright (c) 2021 Kamil Szydlowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
