import React, { Component } from 'react';
import Navigation from './containers/Navigation/Navigation';
import Footer from './containers/Footer/Footer';
import './App.css';
import {Route, Switch} from 'react-router-dom';
import Dashboard from './containers/Dashboard/Dashboard';
import Leaderboards from './containers/Leaderboards/Leaderboards';
import Error from './containers/Error/Error';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navigation />
        <Footer />
        <Switch>
          <Route path="/" component={Dashboard} exact />
          <Route path="/leaderboards" component={Leaderboards} />
          <Route component={Error} />
        </Switch>
      </div>
    );
  }
}

export default App;
