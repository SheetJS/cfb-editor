/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* eslint-env browser */
import { easyStore } from 'react-easy-state';

import * as CFB from 'cfb';
import * as JSZIP from './vendor/jszip';
import { SaveBArray, SaveBString } from './utils/SaveData';
import { fix_string, unfix_string, ab2a, s2a, a2s } from './utils/misc';

export default easyStore({
	fname: "",
	file: null,
	dirty: false,
	loading: false,

	isDirty() { return this.file && this.dirty; },

	setLoading(x) { return this.loading = x; },
	getLoading() { return this.loading; },

	/* Type tests */
	isEmpty() { return !this.file; },
	isCFB() { return this.file && this.file.FullPaths; },
	isZIP() { return this.file && !this.isCFB(); },
	getType() { return this.isCFB() ? "CFB" : this.isZIP() ? "ZIP" : "???"; },

	/* File-level Accessors */
	getFileList() { return this.keys().map((x, i) => [x, this.getFileEntryById(i), i]).filter(x => this.isCFB() ? x[1].type == 2 : !x[1].dir); },
	getNextName(id) { return !id ? this.getNextName(1) : this.find(`SheetJS${id}`) ? this.getNextName(id+1) : `SheetJS${id}`; },
	getRootName() { return !this.isCFB() ? "" : this.getFileNameById(0); },
	getCLSID() { return !this.isCFB() ? "" : this.getFileEntryById(0).clsid; },

	/* File-level Mutators */
	setName(name) { this.fname = name; },
	setBStr(bstr, cb) {
		this.loading = true;
		setTimeout(() => {try {
			switch(bstr.slice(0,4)) {
				case "\xD0\xCF\x11\xE0": this.type = "CFB"; this.file = CFB.read(bstr, {type: "binary"}); break;
				case "PK\x03\x04": case "PK\x05\x06": this.type = "ZIP"; this.file = new JSZIP(bstr, {base64: false}); break;
				default: throw new Error(`Invalid file (magic ${bstr.slice(0,4).split("").map(x => x.charCodeAt(0).toString(16).padStart(2,"0"))})`);
			}
			this.loading = false;
	} catch(e) { this.loading = false; if(cb) cb(e); } }, 100); },
	addNewFile(name) {
		const fname = name || this.getNextName(1);
		if(this.isCFB()) CFB.utils.cfb_add(this.file, fname, [0x37, 0x32, 0x36, 0x32]);
		else if(this.isZIP()) this.file.file(fname, "7262");
		const fi = this.find(fname);
		this.dirty = true;
		return this.isCFB() ? this.getFileNameById(this.entries().indexOf(fi)) : fname;
	},

	/* Entry-level Accessors */
	getFileNameById(id) { return this.keys()[id] || ""; },
	getFileEntryById(id) { return this.entries()[id] || null; },
	getFixedName(id) { return this.isEmpty() ? "" : fix_string(this.getFileNameById(id)); },
	getFixedPath(id) { return this.isEmpty() ? ""
		: this.isCFB() ? fix_string(this.getFileNameById(id)).replace(/^[^/]*/,"")
		: fix_string(this.getFileNameById(id)); },
	getFileTime(id) { return (this.isEmpty() || !this.getFileEntryById(id)) ? new Date(NaN) : (this.getFileTimeEntry(id) || this.getFileTimeEntry(0) || new Date(1980,0,1)); },

	/* Entry-level Mutators */
	setContentAB(id, ab) {
		const payload = ab2a(ab), fn = this.getFileNameById(id);
		if(this.isCFB()) {
			CFB.utils.prep_blob(payload);
			CFB.utils.cfb_add(this.file, fn, ab2a(payload));
		} else if(this.isZIP()) {
			this.file.file(fn, payload.map(x => String.fromCharCode(x)).join(""), {binary:"true"});
		}
		this.dirty = true;
	},
	renFileById(id, name) {
		const oldfn = this.getFileNameById(id), newfn = unfix_string(name).replace(/^\//,"");
		if(this.isCFB()) {
			CFB.utils.cfb_mov(this.file, oldfn, this.getFileNameById(0) + newfn);
			CFB.utils.cfb_gc(this.file);
		} else if(this.isZIP()) {
			this.file.file(newfn, a2s(this.getContentById(id)), {binary: true});
			this.file.remove(oldfn);
		}
		this.dirty = true;
	},
	delFileById(id) {
		const fn = this.getFileNameById(id);
		if(this.isCFB()) CFB.utils.cfb_del(this.file, fn);
		if(this.isZIP()) this.file.remove(fn);
		this.dirty = true;
	},

	/* Download data */
	exportBStrById(id) {
		this.loading = true;
		setTimeout(() => {try {
			const FI = this.getFileEntryById(id);
			SaveBArray(this.getContentByEntry(FI), FI.name);
			this.loading = false;
		} catch(e) { this.loading = false; throw e; } }, 100);
	},
	exportBStr(/*name*/) {
		this.loading = true;
		setTimeout(() => {try {
		this.dirty = false;
		let o;
		if(this.isCFB()) o = SaveBString(CFB.write(this.file, {type:"binary"}), this.fname || "SheetJS.cfb");
		if(this.isZIP()) o = SaveBString(this.file.generate({type:"string", compression:"DEFLATE"}), this.fname || "SheetJS.zip");
		this.loading = false;
		return o;
	} catch(e) { this.loading = false; throw e; } }, 100); },

	/* Initialization */
	newFile(name) {
		this.fname = name || "sheetjs.cfb";
		if(this.fname.match(/\.zip$/)) {
			const out = new JSZIP();
			out.file("Sh33tJ5", "7262");
			this.file = out;
		} else this.file = CFB.utils.cfb_new();
		this.dirty = true;
	},
	reset() { this.file = null; this.fname = ""; this.dirty = false; },

	/* Utils */
	getContentById(id) { return this.getContentByEntry(this.getFileEntryById(id)); },
	getContentByEntry(fi) {
		if(!fi) return [];
		if(fi._data) return typeof fi._data == "string" ? s2a(fi._data) : ab2a(fi._data.getContent());
		return fi.content || []; },
	getContentSliceByEntry(fi, s, e) {
		return !fi ? []
		: fi.content ? fi.content.slice(s, e)
		: this.getContentByEntry(fi).slice(s, e);
	},
	getSizeByEntry(fi) {
		if(this.isCFB() && (!fi.content || !fi.content.length)) return 0;
		return fi && (fi.size || fi._data && (fi._data.uncompressedSize) || fi._data.length) || 0;
	},
	getTextByEntry(fi) {
		if(!fi || (!fi._data && !fi.content)) return "";
		if(fi._data) return (typeof fi._data == "string") ? fi._data : a2s(fi._data.getContent());
		return a2s(fi.content);
	},
	getFileTimeEntry(id) {
		const FI = this.getFileEntryById(id);
		return !FI ? new Date(NaN) : (FI.ct || FI.mt || FI.date || id != 0 && this.getFileTime(0) || new Date(1980,0,1));
	},
	find(path) { return this.isEmpty() ? null
		: this.isCFB() ? CFB.find(this.file, path)
		: this.file.filter((rp, f) => (path == rp || path == f.name))[0]; },
	keys() { return this.isEmpty() ? []
		: this.isCFB() ? this.file.FullPaths
		: Object.keys(this.file.files).filter(x => !this.file.files[x].dir);
	},
	entries() { return this.isEmpty() ? []
		: this.isCFB() ? this.file.FileIndex
		: this.keys().map(x => this.file.files[x]);
	},
	getIdByName(name) {
		if(this.isEmpty()) return -1;
		if(this.isZIP()) {
			const entries = Object.keys(this.file.files).filter(x => !this.file.files[x].dir);
			return entries.indexOf(name);
		}
		return this.entries().indexOf(this.find(name));
	},

	Sheet: "JS"
});
