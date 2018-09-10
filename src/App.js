/* globals localStorage */
import React, { Component } from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import indigo from '@material-ui/core/colors/indigo'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import { arrayMove } from 'react-sortable-hoc'

import ListList from './components/ListList'

const theme = createMuiTheme({
  palette: {
    primary: indigo
  }
})

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      items: [],
      isModalOpen: false,
      addItems: ''
    }

    this.onSortEnd = this.onSortEnd.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount () {
    this.syncItemsWithLocalStorage()
    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener('beforeunload', this.saveStateToLocalStorage.bind(this))
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.saveStateToLocalStorage.bind(this))
    // saves if component has a chance to unmount
    this.saveStateToLocalStorage()
  }

  syncItemsWithLocalStorage () {
    // get the key's value from localStorage
    let value = localStorage.getItem('list')

    // parse the localStorage string and setState
    value = JSON.parse(value)
    if (Array.isArray(value)) {
      this.setState({ items: value })
    }
  }

  saveStateToLocalStorage () {
    localStorage.setItem('list', JSON.stringify(this.state.items))
    // localStorage.setItem('list', null)
  }

  onSortEnd ({ oldIndex, newIndex }) {
    const items = arrayMove(this.state.items, oldIndex, newIndex)
    this.setState({ items })
  }

  onCheck (id) {
    const items = this.state.items.map((item) => {
      if (item.id === id) {
        item.checked = !item.checked
      }
      return item
    })
    this.setState({ items })
  }

  onDelete (id) {
    const items = this.state.items.filter(item => item.id !== id)
    this.setState({ items })
  }

  handleOpen () {
    this.setState({ isModalOpen: true })
  }

  handleClose () {
    this.setState({ isModalOpen: false })
  }

  render () {
    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='title' color='inherit'>List List</Typography>
          </Toolbar>
        </AppBar>
        <div className='container px-0' style={{ paddingBottom: 108 }}>
          <ListList
            items={this.state.items}
            onSortEnd={this.onSortEnd}
            onCheck={this.onCheck}
            onDelete={this.onDelete}
          />
        </div>
        {this.state.isModalOpen === false &&
          <FabAdd onClick={this.handleOpen} />
        }

        <Modal
          aria-labelledby='simple-modal-title'
          aria-describedby='simple-modal-description'
          open={this.state.isModalOpen}
          onClose={this.handleClose}
        >
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
            width: 'calc(100% - 100px)',
            maxWidth: 600,
            margin: '50px auto',
            padding: 32
          }}>
            <Typography variant='title'>Add to list</Typography>
            <Typography variant='subheading'>You can add many by spiting them into multiple lines</Typography>
            <TextField
              rows='4'
              multiline
              fullWidth
              onChange={(e) => this.setState({ addItems: e.target.value })}
              value={this.state.addItems}
            />
            <Button className='mt-3' variant='contained' color='primary' onClick={() => {
              const newItems = this.state.addItems.replace('\r', '').split('\n').map((str) => ({ id: makeId(), text: str, checked: false }))
              const items = this.state.items.concat(newItems)
              this.setState({
                isModalOpen: false,
                addItems: '',
                items
              })
            }}>Add them</Button>
          </div>
        </Modal>
      </MuiThemeProvider>
    )
  }
}

export default App

const FabAdd = ({ onClick }) => (
  <div style={{ position: 'fixed', bottom: 26, width: '100%' }}>
    <div className='container' style={{ textAlign: 'center' }}>
      <Button
        variant='fab'
        color='primary'
        aria-label='Add'
        onClick={onClick}
        style={{ pointerEvents: 'auto' }}
      >
        <AddIcon />
      </Button>
    </div>
  </div>
)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const makeId = (length = 10) => (
  Array(length).join().split(',').map(() => (
    ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  )).join('')
)

/*
'Item 1',
'Item 2',
'Item 3',
'Item 4',
'Item 5',
'Item 6',
'Item 7',
'Item 8',
'Item 9',
'Item 10',
'Item 11',
'Item 12',
'Item 13',
'Item 14',
'Item 15',
'Item 16',
'Item 17',
'Item 18',
'Item 19',
'Item 20',
'Item 21',
'Item 22',
'Item 23',
'Item 24',
'Item 25',
'Item 26',
'Item 27',
'Item 28',
'Item 29',
'Item 30',
'Item 31',
'Item 32',
'Item 33',
'Item 34',
'Item 35',
'Item 36',
'Item 37',
'Item 38',
'Item 39',
'Item 40',
'Item 41',
'Item 42',
'Item 43',
'Item 44',
'Item 45',
'Item 46',
'Item 47',
'Item 48',
'Item 49',
'Item 50'
*/
