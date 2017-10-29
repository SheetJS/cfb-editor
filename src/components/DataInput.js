/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/
import React, { Component } from 'react';

class DataInput extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e) {
		const files = e.target.files;
		if(files && files[0]) this.props.handleFile(files[0]);
	}
	render() { return (
<form className="form-inline">
	<div className="form-group">
		{this.props.title && `${this.props.title}: `}
		<input type="file" className="form-control" id="file" onChange={this.handleChange} />
	</div>
</form>
	); }
}
//<input type="file" className="form-control" id="file" accept={this.props.fmts || "*"} onChange={this.handleChange} />

export default DataInput;