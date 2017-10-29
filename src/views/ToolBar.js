/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { Link } from 'react-router-dom';
import { Icon } from 'react-fa';
import * as Spinner from 'react-spinkit';
import './ToolBar.css';

import store from '../state';
import Tooltip from '../components/Tooltip';
import DirtyBit from '../components/DirtyBit';

class ToolBar extends Component {
	constructor(props) { super(props); this.flipViz = this.flipViz.bind(this); this.force = this.force.bind(this); }
	flipViz() { this.props.flipViz(); this.forceUpdate(); }
	force() { this.forceUpdate(); }
	render() { return (
<div className="ToolBar">
	<div className="AlignLeft"><div className="TitleName">
		CFB Editor
		<Tooltip title={(this.props.viz ? "Hide" : "Show") + " Sidebar"} position="bottom">
			<a onClick={this.flipViz}><Icon name={"caret-" + (this.props.viz ? "left" : "right")} fixedWidth /></a>
		</Tooltip>
		{store.getLoading() && (<Spinner name="line-scale-pulse-out" fadeIn="none" />)}
	</div></div>
	<div className="AlignCenter"><div className="TitleFile">
		{store.fname ? this.props.idx ? (
		<Link to={`/`}>{`<${store.fname}>`}</Link>
		) :
		`<${store.fname}>`
		: null}
		<DirtyBit isDirty={store.isDirty()} />
	</div></div>
	<div className="AlignRight"><div className="TitleIcons">
		{!store.isEmpty() && (
		<Tooltip title="Download archive" position="bottom">
			<a onClick={this.props.exportFile}><Icon name="floppy-o" fixedWidth /></a>
		</Tooltip>
		)}
		{!store.isEmpty() && (
		<Tooltip title="Close archive" position="bottom">
			<a onClick={this.props.erase}><Icon name="close" fixedWidth /></a>
		</Tooltip>
		)}
		<Tooltip title="Show Help" position="bottom">
			<Link to={`/help`}><Icon name="question" fixedWidth /></Link>
		</Tooltip>
		<Tooltip title="About Us" position="bottom">
			<a href="http://sheetjs.com"><img className="Logo" src="logo.png" height="24px" width="24px"/></a>
		</Tooltip>
	</div></div>
</div>
	); }
}
// 	{this.props.idx && `>> ${store.getFixedPath(this.props.idx)}`}
export default easyComp(ToolBar);
