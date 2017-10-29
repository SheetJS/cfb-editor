/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { Link } from 'react-router-dom';
import { Icon } from 'react-fa';
import './TreeList.css';

import store from '../state';
import { fix_string } from '../utils/misc';
import Tooltip from '../components/Tooltip';
import { decode_msi_name } from '../utils/misc';

class TreeList extends Component {
	constructor(props) {
		super(props);
		this.exportFile = this.exportFile.bind(this);
		this.renameFile = this.renameFile.bind(this);
		this.erase = this.erase.bind(this);
	}
	exportFile() { this.props.exportFile(); }
	renameFile() { this.props.renameFile(); }
	erase() { this.props.erase(); }
	render() { if(store.isEmpty()) return (<div className="tree">&nbsp;</div>);
		return (
<div className="tree">

	<b>{`Files in ${store.fname}`}</b><br />
	<ul>
		<li><Link to={`/`}><Icon name="list" fixedWidth />&nbsp;&nbsp;<b>Show Manifest</b></Link></li>
	{store.getFileList().map(([f,,i]) => (
		<li key={i.toString()}>
			<Link to={`/view/${i}`}>
				<Icon name={i == this.props.idx ? "file" : "file-text-o"} fixedWidth />&nbsp;&nbsp;
				{f.replace(/[^/]*\//, "").charCodeAt(0) < 0x3800 || f.replace(/[^/]*\//, "").charCodeAt(0) > 0x4840 ?
					fix_string((store.isCFB() ? f.replace(/[^/]*\//, "  ") : f) + (i == this.props.idx ? " >>": ""))
				: (
					<Tooltip title={`MSI: ${decode_msi_name(f.replace(/[^/]*\//, ""))}`} position="bottom">
						{fix_string((store.isCFB() ? f.replace(/[^/]*\//, "  ") : f) + (i == this.props.idx ? " >>": ""))}
					</Tooltip>
				)}
			</Link>
		</li>
	))}
	</ul>

	<b>Archive Operations</b><br />
	<ul>
		<li><a onClick={this.exportFile}><Icon name="floppy-o" fixedWidth />&nbsp;&nbsp;<b>Download Archive</b></a></li>
		<li><a onClick={this.renameFile}><Icon name="i-cursor" fixedWidth />&nbsp;&nbsp;<b>Rename Archive</b></a></li>
		<li><a onClick={this.props.addFile}><Icon name="plus" fixedWidth />&nbsp;&nbsp;<b>Add file to Archive</b></a></li>
		<li><b>(or drag and drop a file here)</b></li>
		<li><a onClick={this.erase}><Icon name="close" fixedWidth />&nbsp;&nbsp;<b>Close Archive</b></a></li>
	</ul>

</div>
		);
	}
}

export default easyComp(TreeList);
