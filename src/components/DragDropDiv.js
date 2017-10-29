/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/*
  Simple HTML5 file drag-and-drop wrapper
  usage: <DragDropDiv handleFile={handleFile}>...</DragDropFile>
    handleFile(file:File):void;
*/
import React, { Component } from 'react';

class DragDropDiv extends Component {
	constructor(props) {
		super(props);
		this.onDrop = this.onDrop.bind(this);
	}
	suppress(evt) { evt.stopPropagation(); evt.preventDefault(); }
	onDrop(evt) { evt.stopPropagation(); evt.preventDefault();
		const files = evt.dataTransfer.files;
		if(!files || files.length == 0) return;
		this.props.handleFile((files.length == 1) ? files[0] : files);
	}
	render() { return ( <div className="DDD" onDrop={this.onDrop} onDragEnter={this.suppress} onDragOver={this.suppress}>{this.props.children}</div> ); }
}

export default DragDropDiv;