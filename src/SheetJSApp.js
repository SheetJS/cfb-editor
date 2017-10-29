/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
/* eslint-env browser */
import React, { Component } from 'react';
import { easyComp } from 'react-easy-state';
import { /*BrowserRouter as Router,*/ Switch, Route, Redirect } from 'react-router-dom';
import swal from 'sweetalert';
import SplitPane from 'react-split-pane';
import './SheetJSApp.css';

import store from './state';
import ToolBar from './views/ToolBar';
import TreeList from './views/TreeList';
import FileView from './views/FileView';
import ManifestView from './views/ManifestView';
import InitView from './views/InitView';
import DragDropDiv from './components/DragDropDiv';
//import { fix_string, unfix_string } from './utils/misc';
import { MAX_SIZE } from './consts';

const renamePopup = (n) => swal("Enter the new file name", {content:{element:'input', attributes:{placeholder:n}}});

const _ul = (evt) => {
	if(!store.isDirty()) return;
	const msg = `Recent changes have not been saved`;
	swal(msg, {timer:1000});
	return evt.returnValue = msg;
};

class SheetJSApp extends Component {
	constructor(props) {
		super(props);
		this.hfoe = this.handleFileOrEntry.bind(this);
		this.flipViz = this.flip_viz.bind(this);
		this.force = this.force.bind(this);
		this.state = { viz: true };
	}
	componentDidMount() { window.removeEventListener("beforeunload", _ul); window.addEventListener("beforeunload", _ul, true); }

	flip_viz() { this.setState({viz: !this.state.viz}); this.forceUpdate(); }
	force() { if(this.toolbar) this.toolbar.force(); }
	erase() { if(!store.isDirty()) return store.reset();
		swal(`Are you sure you want to close ${store.fname}?`, {buttons:['No', 'Yes']}).then(v => { if(v) store.reset(); });
	}
	renameFile() { renamePopup(store.fname).then(v => { if(v) store.setName(v); }); }
	handleFile(file/*:File|FileList*/) {
		if(!(file instanceof File)) return swal("Please drop only one file");
		return this.handleOneFile(file);
	}
	handleOneFile(file/*:File*/) {
		const doit = () => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const bstr = e.target.result;
				try {
					store.setBStr(bstr, (e) => { swal("Error:" + (e.message||e)); });
					store.setName(file.name);
				} catch(e) { swal("Error:" + (e.message||e)); }
			};
			reader.readAsBinaryString(file);
		};

		let msg = [];
		if(file.size > MAX_SIZE) msg.push("File size " + file.size + " exceeds limit.");
		if(msg.length > 0) {
			msg.push("Operations may be slow. Shall we proceed?");
			const domelt = document.createElement("div");
			domelt.innerHTML = msg.join("<br/>\n");
			swal({content: domelt, buttons:['No', 'Yes']}).then(v => { if(v) doit(); });
		} else doit();
	}
	handleEntry(idx/*:number*/, file/*:File*/) {
		const ReadFileArrayBuffer = (file/*:File*/, cb, opts) => {
			/* Boilerplate to set up FileReader */
			const reader = new FileReader();
			reader.onload = (e) => {
				/* Parse data */
				const ab = e.target.result;
				cb(null, ab);
			};
			if(opts) {
				if(opts.size > 0 && file.size > opts.size) return cb(new Error("File size " + file.size + " exceeds limit"), null);
			}
			reader.readAsArrayBuffer(file);
		};

		ReadFileArrayBuffer(file, (err, ab) => {
			if(err) return swal("Error: " + err.message);
			store.setContentAB(idx, ab);
		}, { size: MAX_SIZE });
	}
	handleFileOrEntry(file/*:File|FileList*/) {
		if(store.isEmpty()) return this.handleFile(file);
		if(!(file instanceof File)) return swal("Please drop only one file");
		const idx = (!this.props.match || this.props.match.params.idx == null) ? -1 : this.props.match.params.idx;
		const opts = { buttons: { open: `Open`, add:  "Add File" } };
		const fname = store.getFixedName(idx);
		if(idx > -1) opts.buttons.update = `Update contents`;
		swal(`${store.fname} ${fname && "(" + fname + ")"} is open.  What do you want to do with ${file.name}?`, opts).then(v => {
			switch(v) {
				case 'open': {
					if(!store.isDirty()) { store.reset(); return this.handleFile(file); }
					swal(`There are unsaved changes.  Are you sure you want to close ${store.fname}?`, {buttons:['No', 'Yes']}).then(v => { if(!v) return; store.reset(); this.handleFile(file); });
				} break;
				case 'add': {
					let fname = "";
					if(!store.find(file.name)) {
						fname = store.addNewFile(file.name);
					} else {
						fname = store.addNewFile();
						swal(`File ${file.name} exists!  New file: ${fname}`);
					}
					const id = store.getIdByName(fname);
					this.handleEntry(id, file);
				} break;
				case 'update': this.handleEntry(idx, file); break;
			}
		});
	}
	newEntry() { const fname = store.addNewFile(); swal("New File: " + fname); }
	exportFile() { store.exportBStr(store.fname || "SheetJS.cfb"); }
	deleteEntry(idx) {
		swal(`Are you sure you want to delete ${store.getFixedName(idx)}`, {buttons:['No', 'Yes']}).then(v => {
			switch(v) {
				case true: store.delFileById(idx); break;
				default: return;
			}
		});
	}
	renameEntry(idx) { renamePopup(store.getFixedPath(idx)).then(v => { if(v) store.renFileById(idx,v); }); }

	render() { return (
<div className="Outer">
	<DragDropDiv handleFile={this.hfoe}>
		<ToolBar idx={this.props.match.params.idx} erase={this.erase} exportFile={this.exportFile} handleFile={this.hfoe} viz={this.state.viz} flipViz={this.flipViz} ref={(tb) => { this.toolbar = tb; }}/>
	</DragDropDiv>
	<div className="Bottom"><SplitPane split="vertical" minSize={50} maxSize={250}
			defaultSize={window.matchMedia && !window.matchMedia("(min-width: 650px)").matches ? 50 : 250}
			style={{height: 'calc(100% - 55px)'}}
			pane1Style={{display:this.state.viz ? "block" : "none"}}>
		{this.state.viz && ( <DragDropDiv handleFile={this.hfoe}>
			<TreeList idx={this.props.match.params.idx} fname={store.fname} exportFile={this.exportFile} erase={this.erase} renameFile={this.renameFile} addFile={this.newEntry} />
		</DragDropDiv>)}
		<DragDropDiv handleFile={this.hfoe}><div className="RightPane">
		{!store.isEmpty() ? (
		<Switch>
			<Route path="/view">
				<FileView idx={this.props.match.params.idx||0} mode={this.props.match.params.mode} deleteEntry={this.deleteEntry} renameEntry={this.renameEntry} handleFile={this.handleEntry} viz={this.state.viz} force={this.force} />
			</Route>
			<Route exact path="/">
				<ManifestView exportFile={this.exportFile} erase={this.erase} renameFile={this.renameFile} addFile={this.newEntry} />
			</Route>
			<Route><Redirect to="/" /></Route>
		</Switch>
		) : (
		<Switch>
			<Route exact path="/">
				<InitView handleFile={this.handleFile} />
			</Route>
			<Route><Redirect to="/" /></Route>
		</Switch>
		)}
		</div></DragDropDiv>
	</SplitPane></div>
</div>
	); }
}

export default easyComp(SheetJSApp);
