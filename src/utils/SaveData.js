/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* eslint-env browser */
/* Save workbook on client side */
import { saveAs } from 'file-saver';

/* see Browser download file example in docs */
const s2ab = (s/*:string*/) => {
	const buf = new ArrayBuffer(s.length);
	const view = new Uint8Array(buf);
	for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
};

const a2ab = (a/*:Array<number>*/) => {
	const o = new ArrayBuffer(a.length);
	const view = new Uint8Array(o);
	for (let i = 0; i!=a.length; ++i) view[i] = a[i];
	return o;
};

export const SaveBString = (str, fname = "sheetjs.out") => {
	saveAs(new Blob([s2ab(str)],{type:"application/octet-stream"}), fname || "sheetjs.out");
};

export const SaveBArray = (arr, fname = "sheetjs.out") => {
	saveAs(new Blob([a2ab(arr)],{type:"application/octet-stream"}), fname || "sheetjs.out");
};
