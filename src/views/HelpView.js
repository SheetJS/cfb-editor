/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { Link } from 'react-router-dom';
//import { Icon } from 'react-fa';
import mdcontent from './HelpView.md';
import Markdown from 'react-markdown';
import './HelpView.css';

/* see https://github.com/rexxars/react-markdown/issues/29 */
function RouterLink(props) { return ( props.href.match(/^\//)
	? <Link to={props.href}>{props.children}</Link>
	: <a href={props.href}>{props.children}</a>
); }

class HelpView extends Component {
	constructor(props) { super(props); }
	render() { return ( <Markdown className="helpview" source={mdcontent} renderers={{Link: RouterLink}} /> );}
}

export default easyComp(HelpView);
