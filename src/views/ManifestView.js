/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { Link, Redirect } from 'react-router-dom';
import { Icon } from 'react-fa';
import './MainPane.css';

import { sprintf } from 'printj';

import store from '../state';
import { format_date, fix_string, decode_msi_name } from '../utils/misc';

class ManifestView extends Component {
	constructor(props) { super(props); }
	render() {
		if(store.isEmpty()) return ( <Redirect to={`/`} /> );
		return (
<div className="conpainer">
	<div><b>Archive Name:</b> {store.fname}</div>
	<div className="minor">&nbsp;</div>
	<div className="minor">&nbsp;</div>
	<div className="flexrow">
		<div className="col-xs-3"><a onClick={this.props.exportFile}><Icon name="floppy-o" fixedWidth /> Download</a></div>
		<div className="col-xs-3"><a onClick={this.props.renameFile}><Icon name="i-cursor" fixedWidth /> Rename</a></div>
		<div className="col-xs-3"><a onClick={this.props.addFile}><Icon name="plus" fixedWidth /> Add File</a></div>
		<div className="col-xs-3"><a onClick={this.props.erase}><Icon name="close" fixedWidth /> Close</a></div>
	</div>
	<div className="minor">Entries can be renamed or deleted from the file view.</div>
	<div className="minor">Entries can be added by dragging and dropping files from your computer.</div>
	<br />
	{store.isCFB() && (<details>
		<summary><b>Metadata</b> (click to show)</summary>
		<b>Root Name:</b> {store.getRootName()}<br />
		<b>CLSID:</b> {store.getCLSID()}<br /><br />
	</details>)}
	<br/>
	<b>File Manifest</b>
	<pre>
		{"  Length     Date   Time    Name\n"}
		{" --------    ----   ----    ----\n"}
		{store.getFileList().map(([fp, fi, i]) => ( <span key={i.toString()}>
			{sprintf("%9lu  %s   ", store.getSizeByEntry(fi), format_date(store.getFileTime(i)))}
			{fp.replace(/.*\//g,"").charCodeAt(0) >= 0x3800 && fp.replace(/.*\//g,"").charCodeAt(0) <= 0x4840 ? (
				<Link to={`/view/${i}`}>{(`${fix_string(fp)} (${decode_msi_name(fp.replace(/.*\//g,""))})`)}</Link>
			) : (
				<Link to={`/view/${i}`}>{fix_string(fp)}</Link>
			)}
			{"\n"}
		</span> ))}
	</pre>
</div>
		); }
}
// 	<h3>{store.fname} {store.getType()}</h3>
export default easyComp(ManifestView);
