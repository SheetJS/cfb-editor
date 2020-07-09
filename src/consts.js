/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
export const THRESH = 24*16;
export const MAX_SIZE = 5<<20;

export const SheetJSFT = [
	"application/zip",
	"application/octet-stream"
].join(",") + [
	"mht", "mhtml",
	"zip", "xlsx", "xlsb", "xlsm", "ods",
	"cfb", "xls", "qpw", "wb3", "ppt", "doc"
].map(function(x) { return "." + x; }).join(",");
