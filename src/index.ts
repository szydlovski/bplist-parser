import { parseObject } from './objects.js';
import { parseHeader, parseTrailer, parseOffsetTable } from './partials.js';

export function parseBplist(data: ArrayBuffer, skipChecks = false) {
	// header
	const headerData = data.slice(0, 8);
	const header = parseHeader(headerData);
	const { identifier, version } = header;
	if (identifier !== 'bplist' && !skipChecks) {
		throw new Error("Invalid binary plist. Expected 'bplist' at offset 0.");
	}
	if (version !== '00' && !skipChecks) {
		throw new Error(
			`Unsupported bplist version ${version}, only 00 is supported`
		);
	}
	
	// trailer
	const trailerData = data.slice(data.byteLength - 32, data.byteLength);
	const trailer = parseTrailer(trailerData);

	// offset table
	const offsetTableData = data.slice(
		trailer.offsetTableOffset,
		trailer.offsetTableOffset + trailer.numObjects * trailer.offsetSize
	);
	const offsetTable = parseOffsetTable(offsetTableData, trailer);

	// return top object
	return parseObject(trailer.topObject, data, offsetTable, trailer);
}
