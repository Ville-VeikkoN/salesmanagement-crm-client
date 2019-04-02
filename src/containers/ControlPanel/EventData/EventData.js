import { Route, withRouter } from 'react-router-dom';
import React, {Component} from 'react';
import MUIDataTable from 'mui-datatables';
import './EventData.css';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';

import EditEvent from './EditEvent';

import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import IconButton from '@material-ui/core/IconButton';
import axios from '../../../axios-options';

class EventData extends Component {

  state = {
    showDialog: false,
    dataToEdit: {}
  }

  mapData(data) {
    let newData = [];
    newData = data.map((object) => {
      let rowData = [];
      for (let data in object) {
        if (data === 'eventType') {
          switch(object[data]) {
          case 0:
            rowData.push('Yhteydenotto');
            break;
          case 1:
            rowData.push('Tapaaminen');
            break;
          case 2:
            rowData.push('Tarjous');
            break;
          case 3:
            rowData.push('Myynti');
            break;
          default:
            rowData.push(undefined);
            break;
          }
        } else {
          rowData.push(object[data]);
        }
      }
      rowData.push(
        <IconButton aria-label='Delete' onClick={()=>{
          this.onClickDeleteHandler(object.eventId);
        }}>
          <DeleteIcon />
        </IconButton>
      );
      rowData.push(
        <IconButton aria-label='Create' onClick={() => this.onClickEditHandler(object)}> 
          <CreateIcon />
        </IconButton>
      );
      return rowData;
    });

    return newData;
  }
  
  onClickDeleteHandler(e) {
    this.setState({showDialog: true});
  }
  
  onClickEditHandler = (event) => {
    this.setState({dataToEdit: event}, () => {
      this.props.history.push('/admin/events/edit/'+event.eventId);
    });
  }

  onClickCloseHandler(name) {
    if(name === 'delete') {
      axios.delete('/events/'+this.state.eventId)
        .then((res) => {
          this.props.update();
        })
        .catch(err => console.log(err));
    }
    this.setState({showDialog: false});
  }

  render() {
    const data = this.props.data;   
    const newData = this.mapData(data);

    const columns = [
      {
        name: 'ID',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Luotu',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Yhteyshenkilö',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Puhelin',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Email',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Tyyppi',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Summa',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Paikka',
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: 'Huom',
        options: {
          filter: false,
          sort: true,
        }
      },{
        name: 'Poista'
      },{
        name: 'Muokkaa'
      }
    ];

    const options = {
      filterType: 'multiselect',
      selectableRows: false,
      search: false,
      filter: false,
      textLabels: {
        body: {
          noMatch: 'Ei tuloksia',
          toolTip: 'Järjestä',
        },
        pagination: {
          next: 'Seuraava sivu',
          previous: 'Edellinen sivu',
          rowsPerPage: 'Rivejä / sivu:',
          displayRows: '-',
        },
        toolbar: {
          search: 'Etsi',
          downloadCsv: 'Lataa CSV',
          print: 'Tulosta',
          viewColumns: 'Sarakkeet',
          filterTable: 'Suodata',
        },
        viewColumns: {
          title: 'Näytetyt Sarakkeet',
          titleAria: 'Näytä/Piilota Taulukon Sarakkeet',
        },
        selectedRows: {
          text: 'rivejä valittu',
          delete: 'Poista',
          deleteAria: 'Poista Valitut Rivit',
        },
      }
    
    };

    return (
      <div className='EventData'>
        {this.state.showDialog ? <AlertDialog title='Poista tapahtuma' description = 'Haluatko varmasti poistaa tapahtuman?' handleClose={this.onClickCloseHandler.bind(this)} /> : null}
        <div id='table'>
          <Route path='/admin/events' exact render={() => 
            <MUIDataTable
              title={'Tapahtumat'}
              data={newData}
              columns={columns}
              options={options}
            />
          } />
          <Route path='/admin/events/edit/:id' render={() => 
            <EditEvent leadNames={this.props.leadNames} data={this.state.dataToEdit}/>
          } />
        </div>  
      </div>
      
    );
  }
}

export default withRouter(EventData);