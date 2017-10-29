/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* eslint-env browser */
import React, { PureComponent } from 'react';
import { easyComp } from 'react-easy-state';
import { Link, Redirect } from 'react-router-dom';
import { Icon } from 'react-fa';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { arduinoLight } from 'react-syntax-highlighter/styles/hljs';
import * as Spinner from 'react-spinkit';
import './MainPane.css';

import { sprintf } from 'printj';
import { buf } from 'crc-32';

import store from '../state';
import DataInput from '../components/DataInput';
import { line, fix_string, decode_msi_name } from '../utils/misc';
import { THRESH } from '../consts';
import xml from '../utils/xml';

/* TODO: load through state so screen doesn't block on render */
class FileView extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {loading: true, FN:"", _size:0, _crc32:"", show_text:false, indexData:[]};
		["export", "delete", "rename", "handle", "stload", "common"].forEach(n => { this[n] = this[n].bind(this); });
	}
	componentWillMount() { this.common(this.props, true); }
	componentWillReceiveProps(nextProps) { this.common(nextProps, false); return true; }
	export() { store.exportBStrById(this.props.idx); }
	delete() { this.props.deleteEntry(this.props.idx); }
	rename() { this.props.renameEntry(this.props.idx); }
	handle(f) { this.props.handleFile(this.props.idx, f); }
	stload() { }
	common(props/*, mnt*/) {
		if(!this.state.loading) { this.setState({loading:true}); }
		//const doit = mnt || this.props.idx != props.idx || this.props.mode != props.mode;
		setTimeout(() => {
			const FP = store.getFileNameById(props.idx), FI = store.getFileEntryById(props.idx);
			if(!FP || !FI || store.isCFB() && FI.type != 2) return this.setState({loading:false});
			const FN = fix_string(FI.name);

			const content = store.getContentByEntry(FI);
			const _size = store.getSizeByEntry(FI);
			const _crc32 = sprintf("%0.8X", buf(content));

			const show_text = props.mode == "text";
			const T = show_text ? store.getTextByEntry(FI) : "";
			const doxml = T && (T.slice(0,6) == "<?xml " || T.slice(0,100).match(/^<\w*(:\w+)?[\s/>]/));

			let show_link = props.mode || "text"; if(show_link == "full") show_link = "text";
			if(!props.mode || props.mode == "full") {
				const hdr = store.getContentSliceByEntry(FI,0,16);
				if(hdr[0] == 0xFF && hdr[1] == 0xD8 && hdr[2] == 0xFF) show_link = "imag";
			}

			const show_imag = this.props.mode == "imag", I = show_imag ? "data:image/jpeg;base64," + btoa(store.getTextByEntry(FI)) : "";

			const Target = this.props && this.props.mode ? store.getSizeByEntry(FI) : Math.min(store.getSizeByEntry(FI),THRESH);
			const indices = Array.from({length:(Target)+15>>4}).map((x,i) => 16*i);
			const indexData = (T || I) ? [] : indices.map(x => line([x, store.getContentSliceByEntry(FI, x,x+16)]));
			this.setState({ loading:false, FN, _size, _crc32, show_text, T, doxml, show_link, show_imag, I, indices, indexData });
			this.forceUpdate();
		}, 0);
	}
	render() {
		const FP = store.getFileNameById(this.props.idx), FI = store.getFileEntryById(this.props.idx);
		if(!FP || !FI || store.isCFB() && FI.type != 2) return ( <Redirect to={`/`} /> );

		const _FP = fix_string(FP);

		/* indices, indices.map(x => line([x, store.getContentSliceByEntry(FI, x,x+16)])) */
		const { FN, _size, _crc32, show_text, T, doxml, show_link, show_imag, I, indices, indexData } = this.state;
		const partial = _size > THRESH && !this.props.mode;

		const show_link_txt = { "text": "Text", "imag": "Image" }[show_link];
		const out = (
<div className="conpainer">
	<div><b>File Name:</b> {FN} {FN.charCodeAt(0) >= 0x3800 && FN.charCodeAt(0) <= 0x4840 && `MSI Name: ${decode_msi_name(FN)}`}</div>
	<div className="minor">{FN != FI.name ? `File name has non-display characters, which are rendered as "\\u" followed by character code` : `\u00A0`}</div>
	<div className="minor">&nbsp;</div>
	<div className="flexrow">
		<div className="col-xs-4"><a onClick={this.export}><Icon name="download" fixedWidth /> Export Entry</a></div>
		<div className="col-xs-4"><a onClick={this.delete}><Icon name="chain-broken" fixedWidth /> Delete Entry</a></div>
		<div className="col-xs-4"><a onClick={this.rename}><Icon name="i-cursor" fixedWidth /> Rename Entry</a></div>
	</div>
	<br />
	<DataInput handleFile={this.handle} title={`Replace file contents`} />
	<div className="minor">You can also drag and drop a file.</div><br/>
	<details>
		<summary><b>Entry Metadata</b> (click to show)</summary>
		<b>Full Path:</b> {_FP}<br />
		<b>Size:</b> {_size} bytes<br />
		<b>CRC32:</b> {_crc32}<br />
	</details>
	<br />
	<b>
		{partial ? `Showing First ${THRESH} Bytes` : "Showing File Contents"}
		{partial && ( <Link to={`/view/${this.props.idx}/full`}> (Full Contents) </Link> )}
		{show_link && show_link != this.props.mode && ( <Link to={`/view/${this.props.idx}/${show_link}`} onClick={this.stload}> (View as {show_link_txt}) </Link> )}
	</b>
	{this.state.loading ? (
		<Spinner name="line-scale-pulse-out" fadeIn="none" />
	) : show_text ? (
		<SyntaxHighlighter style={arduinoLight} customStyle={{width:`calc(100vw - ${this.props.viz ? 300 : 50}px)`}}>{doxml ? xml(T) : T}</SyntaxHighlighter>
	) : show_imag ? (
		<div>
			<img src={I} />
		</div>
	) : !indices.length ? (
		<pre>(file is empty)</pre>
	) : (
		<pre>{indexData}</pre>
	)}
</div>
		);
		return out;
	}
}
export default easyComp(FileView);
