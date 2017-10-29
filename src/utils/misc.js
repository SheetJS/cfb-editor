/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* global Uint8Array */
import { sprintf, vsprintf } from 'printj';

const X = "%02hhx", Y = X + X + " ";
const FMT = [...Array.from({length:16}).map((x,i) =>
	Y.repeat(i>>1) + (i%2 ? X:"  ") + "   " + "     ".repeat(7 - (i >> 1)) + "|" + "%c".repeat(i) + " ".repeat(16-i) + "|\n"
), Y.repeat(8) + "|" + "%c".repeat(16) + "|\n"];
export const line = ([x,d]) => {
	if(!d || !d.length) return "";
	if(!FMT[d.length]) return "wtf";
	return vsprintf("%04x: " + FMT[d.length], [x, ...d, ...d.map(x => String.fromCharCode(x).replace(/[^\x20-\x7E]/g,"."))]);
};

export const fix_string = (x) => x.replace(/[\u0000-\u001f]/, ($$) => sprintf("\\u%04X", $$.charCodeAt(0)));

export const unfix_string = (x) => x.replace(/\\u(\d{4})/g, ($$, $1) => String.fromCharCode(parseInt($1, 16)));

export const format_date = (date/*:Date*/) => sprintf("%02u-%02u-%02u %02u:%02u", date.getUTCMonth()+1, date.getUTCDate(), date.getUTCFullYear()%100, date.getUTCHours(), date.getUTCMinutes());

export const ab2a = (ab) => {
	const o = [], u = new Uint8Array(ab);
	for(let i = 0; i < u.length; ++i) o[i] = u[i];
	return o;
};

export const s2a = x => x.split("").map(x => x.charCodeAt(0));

export const a2s = x => {
	const a = new Array(x.length);
	for(let i = 0; i < x.length; ++i) a.push(String.fromCharCode(x[i]));
	return a.join("");
};

const decode_msi_char = (x) => {
  switch(true) {
    case x<10:  return x + 48;
    case x<36:  return x + 55;
    case x<62:  return x + 61;
    case x==62: return 46;
  }
  return 95;
};

export const decode_msi_name = (instr) => {
  var ch = instr.charCodeAt(0);
  var idx = 0;
  var out = [];
  if(ch == 0x4840) { ++idx; /*out.push("*");*/ }
  while ((ch = instr.charCodeAt(idx++))) {
    if(ch >= 0x3800 && ch < 0x4840 ) {
      if(ch >= 0x4800) {
        ch = decode_msi_char(ch-0x4800);
      } else {
        ch -= 0x3800;
        out.push(String.fromCharCode(decode_msi_char(ch & 0x3f)));
        ch = decode_msi_char( (ch>>6) & 0x3f);
      }
    }
    out.push(String.fromCharCode(ch));
  }
  return out.join("");
};