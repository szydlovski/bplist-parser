import { decodeUtf8, parseBytesAsUInt } from './helpers.js';
import {
	PropertyListHeader,
	PropertyListTrailer,
	PropertyListOffsetTable,
} from './types.js';

export function parseHeader(data: ArrayBuffer): PropertyListHeader {
	const identifier = decodeUtf8(data.slice(0, 6));
	const version = decodeUtf8(data.slice(6, 8));
	return { identifier, version };
}

export function parseTrailer(data: ArrayBuffer): PropertyListTrailer {
	const view = new DataView(data);
	const offsetSize = view.getUint8(6);
	const objectRefSize = view.getUint8(7);
	const numObjects = Number(view.getBigUint64(8));
	const topObject = Number(view.getBigUint64(16));
	const offsetTableOffset = Number(view.getBigUint64(24));
	return {
		offsetSize,
		objectRefSize,
		numObjects,
		topObject,
		offsetTableOffset,
	};
}

export function parseOffsetTable(
	data: ArrayBuffer,
	trailer: PropertyListTrailer
): PropertyListOffsetTable {
	const offsetTable: number[] = [];
	const { numObjects, offsetSize } = trailer;
	for (let i = 0; i < numObjects; i++) {
		offsetTable[i] = parseBytesAsUInt(
			data.slice(i * offsetSize, (i + 1) * offsetSize)
		);
	}
	return offsetTable;
}
