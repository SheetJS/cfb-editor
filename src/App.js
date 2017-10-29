/* cfb-editor (C) 2017-present  SheetJS -- http://sheetjs.com */
import React, {Component} from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import SheetJSApp from './SheetJSApp';
import HelpView from './views/HelpView';

class App extends Component {
	render() { return (
<Router basename="/cfb-editor">
	<Switch>
		<Route path="/view/:idx/:mode" component={SheetJSApp} />
		<Route path="/view/:idx" component={SheetJSApp} />
		<Route exact path="/" component={SheetJSApp} />
		<Route exact path="/help" component={HelpView} />
		<Route render={() => (
			<Redirect to={`/`}/>
		)}/>
	</Switch>
</Router>
	); }
}

export default App;
