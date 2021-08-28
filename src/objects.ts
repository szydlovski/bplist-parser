import {
	parseAsciiString,
	parseBytesAsFloat,
	parseBytesAsUInt,
	parseUtf16BeString,
	splitByte,
} from './helpers.js';
import {
	ObjectMeta,
	PropertyListOffsetTable,
	PropertyListTrailer,
} from './types.js';

export function parseObject(
	tableOffset: number,
	data: ArrayBuffer,
	offsetTable: PropertyListOffsetTable,
	trailer: PropertyListTrailer
) {
	const view = new DataView(data);
	const offset = offsetTable[tableOffset];
	const objectOffset = offset + 1;
	const [objectType, objectInfo] = splitByte(view.getUint8(offset));
	const objectMeta = {
		objectOffset,
		objectType,
		objectInfo,
	};
	
	switch (objectType) {
		case 0x0:
			// simple type
			return parseBplistSimpleType(objectMeta);
		case 0x1:
			// integer
			return parseBplistInteger(objectMeta, data);
		case 0x2:
			// float
			return parseBplistFloat(objectMeta, data);
		case 0x3:
			// date
			return parseBplistDate(objectMeta, data);
		case 0x4:
			// raw data
			return parseBplistRawData(objectMeta, data);
		case 0x5:
			// utf8 string
			return parseBplistString(objectMeta, data, false);
		case 0x6:
			// utf16 string
			return parseBplistString(objectMeta, data, true);
		case 0x8:
			// uid
			return parseBplistUid(objectMeta, data);
		case 0xa:
			// array
			return parseBplistArray(objectMeta, data, offsetTable, trailer);
		case 0xd:
			// dictionary
			return parseBplistDictionary(objectMeta, data, offsetTable, trailer);
		default:
			throw new Error('Unhandled type 0x' + objectType.toString(16));
	}
}

export function parseBplistSimpleType({ objectInfo }: ObjectMeta) {
	switch (objectInfo) {
		case 0x0:
			return null;
		case 0x8:
			return false;
		case 0x9:
			return true;
		case 0xf:
			return null;
		default:
			throw new Error('Unhandled simple type 0x' + objectInfo.toString(16));
	}
}

export function parseBplistInteger(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer
) {	
	return parseBytesAsUInt(
		data.slice(objectOffset, objectOffset + 2 ** objectInfo)
	);
}

export function parseBplistFloat(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer
) {
	return parseBytesAsFloat(
		data.slice(objectOffset, objectOffset + 2 ** objectInfo)
	);
}

export function parseBplistDate({ objectOffset }: ObjectMeta, data: ArrayBuffer) {
	const timestamp = new DataView(data).getFloat64(objectOffset);
	return new Date(978307200000 + timestamp * 1000);
}

export function parseBplistRawData(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer
) {
	const [dataOffset, dataLength] = getOffsetAndLength(
		new DataView(data, objectOffset),
		objectInfo
	);
	return data.slice(
		objectOffset + dataOffset,
		objectOffset + dataOffset + dataLength
	);
}

export function parseBplistString(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer,
	utf16: boolean
) {
	const [stringOffset, stringLength] = getOffsetAndLength(
		new DataView(data, objectOffset),
		objectInfo
	);
	const stringData = data.slice(
		objectOffset + stringOffset,
		objectOffset + stringOffset + (utf16 ? stringLength * 2 : stringLength)
	);	
	return utf16
		? parseUtf16BeString(stringData)
		: parseAsciiString(stringData);
}

export function parseBplistUid(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer
) {
	return {
		UID: parseBytesAsUInt(
			data.slice(objectOffset, objectOffset + objectInfo + 1)
		),
	};
}

export function parseBplistArray(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer,
	offsetTable: PropertyListOffsetTable,
	trailer: PropertyListTrailer
) {
	const [arrayOffset, arrayLength] = getOffsetAndLength(
		new DataView(data, objectOffset),
		objectInfo
	);
	const { objectRefSize } = trailer;
	const array: any[] = [];
	for (let i = 0; i < arrayLength; i++) {
		const valRefStart = objectOffset + arrayOffset + i * objectRefSize;
		const valRef = parseBytesAsUInt(
			data.slice(valRefStart, valRefStart + objectRefSize)
		);
		array[i] = parseObject(valRef, data, offsetTable, trailer);
	}
	return array;
}

export function parseBplistDictionary(
	{ objectOffset, objectInfo }: ObjectMeta,
	data: ArrayBuffer,
	offsetTable: PropertyListOffsetTable,
	trailer: PropertyListTrailer
) {
	const [dictOffset, dictLength] = getOffsetAndLength(
		new DataView(data, objectOffset),
		objectInfo
	);
	const { objectRefSize } = trailer;
	const dict: Record<string, any> = {};
	for (let i = 0; i < dictLength; i++) {
		// key
		const keyRefStart = objectOffset + dictOffset + i * objectRefSize;
		const keyRef = parseBytesAsUInt(
			data.slice(keyRefStart, keyRefStart + objectRefSize)
		);
		const key = parseObject(keyRef, data, offsetTable, trailer);
		// value
		const valRefStart = keyRefStart + dictLength * objectRefSize;
		const valRef = parseBytesAsUInt(
			data.slice(valRefStart, valRefStart + objectRefSize)
		);
		const val = parseObject(valRef, data, offsetTable, trailer);		
		dict[key as string] = val;
	}
	return dict;
}

export function getOffsetAndLength(
	view: DataView,
	objectInfo: number
): [number, number] {
	let dataOffset = 0;
	let dataLength = objectInfo;
	if (objectInfo === 0xf) {
		const [intType, intInfo] = splitByte(view.getUint8(0));
		if (intType !== 0x1) {
			throw new Error(`Unexpected int length: ${intType}`);
		}
		const intLength = 2 ** intInfo;
		dataOffset = 1 + intLength;
		// to można zrobić ładniej
		dataLength = parseBytesAsUInt(
			view.buffer.slice(view.byteOffset + 1, view.byteOffset + 1 + intLength)
		);
	}
	return [dataOffset, dataLength];
}
