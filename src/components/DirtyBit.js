/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/*
  Simple Marker when a file is dirty
  usage: <DirtyBit isDirty={isdirty} />
    isDirty:boolean
*/
import React, { Component } from 'react';

import Tooltip from './Tooltip';

class DirtyBit extends Component {
	constructor(props) { super(props); }
	render() { return this.props.isDirty ? ( <Tooltip title="File has unsaved changes" position="bottom">**</Tooltip> ) : ""; }
}

export default DirtyBit;
