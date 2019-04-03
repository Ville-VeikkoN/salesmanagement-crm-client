import React, { Component } from 'react';
import {Switch, Route, withRouter} from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ModalContent from './components/ModalContent/ModalContent';
import Modal from '@material-ui/core/Modal';

import Dashboard from './containers/Dashboard/Dashboard';
import Error from './containers/Error/Error';
import Leaderboards from './containers/Leaderboards/Leaderboards';
import Events from './containers/Events/Events';
import Navigation from './containers/Navigation/Navigation';
import Login from './containers/Login/Login';
import ControlPanel from './containers/ControlPanel/ControlPanel';

import axios from './axios-options';

import './App.css';

const {getDate} = require('./utils/Date');

class App extends Component {

  anonUserDetails = {
    roles: [
      'ANONYMOUS'
    ]
  }

  state = {
    loggedIn: false,
    modalOpen: false,
    user_id: '',
    loadingLeads: true,
    loadingAdminData: true,
    loadingLeaderBoards: true,
    loadingUserEvents: true,
    loadingUserData: true,
    loadingCompany: true,
    leads: [], 
    leaderBoards: [],
    userEvents: [],
    user: {},
    userData: {},
    user_details: this.anonUserDetails,
    companyData: [],
    companyStartDate: getDate('monthFirst'),
    companyEndDate: getDate('monthLast'),
    leaderStartDate: new Date('Undefined'),
    leaderEndDate: new Date('Undefined')
  }

  validateDate = this.validateDate.bind(this);

  componentDidMount() {
    const jwt = localStorage.getItem('accessToken');

    if (jwt) {
      this.handleLogin();
    }
  }

  updateAll() {
    this.updateCompanyData(this.state.companyStartDate, this.state.companyEndDate);
    this.updateLeads();
    this.updateLeaderBoards();
    this.updateUserEvents();
    this.updateUserData();
    this.updateAdmin();
  }

  updateCompanyData(startDate, endDate) {
    let start = undefined;
    let end = undefined;
    
    if (startDate === undefined && endDate === undefined) {
      start = this.state.companyStartDate;
      end = this.state.companyEndDate;
    } else {
      start = startDate;
      end = endDate;
    }

    const jwt = localStorage.getItem('accessToken');

    let url_companyChart = `/companyChart/get/${start}/${end}`;
    this.setState({loadingCompany: true, companyStartDate: start, companyEndDate: end}, () => {
      axios.get(url_companyChart, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then(res => this.setState({companyData: res.data}, () => {
          this.setState({loadingCompany: false});
        }));
    });
  }

  updateUserEvents() {
    const jwt = localStorage.getItem('accessToken');

    let url_userEvents = `/userEvents/${this.state.user_details.userId}`;
    this.setState({loadingUserEvents: true}, () => {
      axios.get(url_userEvents, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then(userEvents => {
          this.setState({userEvents: userEvents.data, modalOpen: false}, () => {
            this.setState({loadingUserEvents: false});
          });
        })
        .catch(err => console.log(err));
    });
  }

  updateUserData() {
    const jwt = localStorage.getItem('accessToken');

    let url_userData = `/userData/${this.state.user_details.userId}`;
    this.setState({loadingUserData: true}, () => {
      axios.get(url_userData, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then(userData => {
          this.setState({userData: userData.data, modalOpen: false}, () => {
            this.setState({loadingUserData: false});
          });
        })
        .catch(err => console.log(err));
    });
  }

  updateLeaderBoards() {
    const jwt = localStorage.getItem('accessToken');

    this.setState({loadingLeaderBoards: true}, () => {
      axios.get('/userData/all', {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then(res => this.setState({leaderBoards: res.data, modalOpen: false}, () => {
          this.setState({loadingLeaderBoards: false});
        }));
    });  
  }

  updateLeaderBoardsByDate(startDate, endDate) {
    this.setState({leaderStartDate: startDate, leaderEndDate: endDate}, () => {
      this.validateDate(startDate, endDate);
    });
  }

  validateDate(startDate, endDate) {
    const jwt = localStorage.getItem('accessToken');

    this.setState({loadingLeaderBoards: true}, () => {
      if (startDate.toString() !== 'Invalid Date' && endDate.toString() !== 'Invalid Date') {
        axios.get(`/userData/all/${startDate}/${endDate}`, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
          .then(res => this.setState({leaderBoards: res.data, modalOpen: false}, () => {
            this.setState({loadingLeaderBoards: false});
          }));
      } else if (startDate.toString() !== 'Invalid Date') {
        axios.get(`/userData/all/${startDate}/2100-01-01`, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
          .then(res => this.setState({leaderBoards: res.data, modalOpen: false}, () => {
            this.setState({loadingLeaderBoards: false, leaderEndDate: new Date('Undefined')});
          }));
      } else if (endDate.toString() !== 'Invalid Date') {
        axios.get(`/userData/all/1970-01-01/${endDate}`, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
          .then(res => this.setState({leaderBoards: res.data, modalOpen: false}, () => {
            this.setState({loadingLeaderBoards: false, leaderStartDate: new Date('Undefined')});
          }));
      } else {
        this.setState({leaderStartDate: new Date('Undefined'), leaderEndDate: new Date('Undefined')}, () => {
          this.updateLeaderBoards();
        });
      }
    });
  }

  updateLeads() {
    const jwt = localStorage.getItem('accessToken');
    this.setState({loadingLeads: true}, () => {
      axios.get('/leads', {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then(res => this.setState({leads: res.data, modalOpen: false}, () => {
          this.setState({loadingLeads: false});
        }));
    });
  }

  updateAdmin() {
    if (this.state.user_details.roles[1] !== undefined) {
      const jwt = localStorage.getItem('accessToken');
      this.setState({loadingAdminData: true}, () => {
        axios.get('/admin', {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
          .then(res => this.setState({adminData: res.data, modalOpen: false}, () => {
            this.setState({loadingAdminData: false});
          }));
      });  
    } else {
      this.setState({loadingAdminData: false});
    }
  }

  /**
   * Handles logging the user in
   * 
   * @param {String} name 
   */
  handleLogin() {
    const jwt = localStorage.getItem('accessToken');
    axios.get('/users/details', {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    })
      .then((res) => {
        if (res.data.user === undefined) {
          this.setState({loggedIn: false, user_details: this.anonUserDetails});
        } else {
          this.setState({loggedIn: true, user_details: res.data.user}, () => {
            this.updateAll();
          });  
        }
      })
      .catch((err) => { 
        this.setState({loggedIn: false, user_details: this.anonUserDetails});
        console.log(err);
      });
  }

  handleLogout() {
    this.setState({loggedIn: false, user_details: this.anonUserDetails}, () => {
      localStorage.removeItem('accessToken');
    });
  }

  modalClose() {
    this.setState({modalOpen: false});
  }

  modalOpen() {
    this.setState({modalOpen: true});
  }

  render() {
    if (!this.state.loggedIn) {
      return (
        <div>
          <Login onLogin={this.handleLogin.bind(this)} />
        </div>
      );
    }

    if (this.state.loadingLeads || this.state.loadingLeaderBoards || this.state.loadingCompany
      || this.state.loadingUserData || this.state.loadingUserEvents || this.state.loadingAdminData) {
      return (
        <div className='App'>
          <Navigation handleLogout = {this.handleLogout.bind(this)} />
        </div>
      );
    }
    
    return (
      <div className='App'>
        <Navigation roles={this.state.user_details.roles} handleLogout={this.handleLogout.bind(this)} />
        <Switch>
          <Route path='/' render={() => <Dashboard 
            user={this.state.user_details} 
            userData={this.state.userData} 
            companyData={this.state.companyData}
            companyDates={[this.state.companyStartDate, this.state.companyEndDate]}
            updateCompany={this.updateCompanyData.bind(this)} 
            user_id={this.state.user_details.userId}/>} 
          exact />
          <Route path='/leaderboards' render={() => <Leaderboards leaderDates={[this.state.leaderStartDate, this.state.leaderEndDate]} updateDate={this.updateLeaderBoardsByDate.bind(this)} data={this.state.leaderBoards} />} />
          <Route path='/events' render={() => <Events data={this.state.userEvents} />} />
          {this.state.user_details.roles[1] !== undefined ? 
            <Route path='/admin' render={() => <ControlPanel leads={this.state.leads} update={this.updateAll.bind(this)} user_id={this.state.user_id} data={this.state.adminData} />} />
            : null}
          <Route component={Error} />
        </Switch>
        <div className='add-wrapper'>
          <Fab className='add-icon' onClick={this.modalOpen.bind(this)} size='large' color='primary'>
            <AddIcon />
          </Fab>
        </div>
        <Modal 
          open={this.state.modalOpen} 
          onClose={this.modalClose.bind(this)}
          className='modal-wrapper'
          onEscapeKeyDown={this.modalClose.bind(this)}>
          <ModalContent
            updateUserData={this.updateUserData.bind(this)}
            updateLeaderBoards={this.updateLeaderBoards.bind(this)} 
            updateUserEvents={this.updateUserEvents.bind(this)}
            updateLeads={this.updateLeads.bind(this)} 
            updateCompanyGraph={this.updateCompanyData.bind(this)}
            userId={this.state.user_details.userId} 
            closeModal={this.modalClose.bind(this)} 
            leads={this.state.leads}/>
        </Modal>
      </div>
    );
  }
}

export default withRouter(App);
