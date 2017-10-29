/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* eslint-env browser */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { Link, Redirect } from 'react-router-dom';
import './InitView.css';

import store from '../state';
import DataInput from '../components/DataInput';
import { SheetJSFT } from '../consts';

class InitView extends Component {
	constructor(props) { super(props); }
	newCFB() { store.newFile("SheetJS.cfb"); }
	newZIP() { store.newFile("SheetJS.zip"); }
	render() { if(!store.isEmpty()) return ( <Redirect to={`/`}/> );
		return (
<div className="conpainer">
	<br/>
	<div className="Title">Welcome to CFB Editor</div>
	<div className="Subtitle">View and Edit archives with ease</div><br /><br />
	<DataInput handleFile={this.props.handleFile} title={`Read a file on your device`} fmts={SheetJSFT} />
	<div className="minor">Your data never leaves your device</div>
	<div>You can also drag and drop a file into the window</div>
	<br />
	<a onClick={this.newZIP}>Click here to make a new ZIP archive</a><br />
	<br />
	<a onClick={this.newCFB}>Click here to make a new CFB archive</a><br />
	<br />
	<details>
		<summary><b>Download Sample Files</b> (click to show)</summary>
		<a href="http://oss.sheetjs.com/test_files/pivot_table_test.xls"  >CFB: pivot_table_test.xls</a><br /><br />
		<a href="http://oss.sheetjs.com/test_files/pivot_table_test.xlsb" >ZIP: pivot_table_test.xlsb</a><br />
	</details>
	<br />
	<Link to={`/help`}>Show Help</Link><br />
	<br />
	{ window.matchMedia && !window.matchMedia("(min-width: 800px)").matches ? ( <div className="minor">(some items may not fit, consider using a wider screen)</div> ) : ( <br /> )}
	<br />
	<br />
	<div className="minor"><a className="minor" href="http://sheetjs.com">Copyright (C) 2017-present SheetJS LLC</a></div>
</div>
		); }
}

export default easyComp(InitView);
