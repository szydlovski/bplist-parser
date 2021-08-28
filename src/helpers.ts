export function decodeUtf8(data: ArrayBuffer) {
	return new TextDecoder().decode(data);
}

export function parseBytesAsUInt(buffer: ArrayBuffer) {
	if (buffer.byteLength === 16) {
		return parseInt(
			[...new Uint8Array(buffer)]
				.map((byte) => byte.toString(16).padStart(2, '0'))
				.join(''),
			16
		);
	}
	return new Uint8Array(buffer).reduce((sum, next) => (sum << 8) | next, 0);
}



export function splitByte(byte: number): [number, number] {
	if (byte < 0x00 || byte > 0xff)
		throw new Error(`Bytes must be between ${0x00} and ${0xff}, got ${byte}`);
	return [(byte & 0xf0) >> 4, byte & 0x0f];
}

export function parseBytesAsFloat(data: ArrayBuffer) {
	const view = new DataView(data);
	switch (data.byteLength) {
		case 4:
			return view.getFloat32(0);
		case 8:
			return view.getFloat64(0);
		default:
			throw new Error(`Unhandled float length ${data.byteLength}`);
	}
}

export function parseAsciiString(data: ArrayBuffer) {
	return decodeUtf8(data);
}

export function parseUtf16BeString(input: ArrayBuffer) {
	const view = new Uint16Array(input);
	let result = '';
	for (const value of view) {
		result += String.fromCharCode(swap16(value));
	}
	return result;
}

function swap16(value: number) {
	return ((value & 0xff00) >> 8) | ((value & 0x00ff) << 8);
}