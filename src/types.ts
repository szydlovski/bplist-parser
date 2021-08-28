export interface PropertyListHeader {
	identifier: string;
	version: string;
}

export interface PropertyListTrailer {
	offsetSize: number;
	objectRefSize: number;
	numObjects: number;
	topObject: number;
	offsetTableOffset: number;
}

export type PropertyListOffsetTable = number[];

export type ObjectMeta = {
	objectOffset: number;
	objectType: number;
	objectInfo: number;
};