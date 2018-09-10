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
      sortingItem: null,
      isModalOpen: false,
      textarea: ''
    }

    this.onSortStart = this.onSortStart.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount () {
    this.loadStateFromLocalStorage()
    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener('beforeunload', this.saveStateToLocalStorage.bind(this))
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.saveStateToLocalStorage.bind(this))
    // saves if component has a chance to unmount
    this.saveStateToLocalStorage()
  }

  loadStateFromLocalStorage () {
    let value = localStorage.getItem('list')

    // parse the localStorage string and setState
    value = JSON.parse(value)
    if (Array.isArray(value)) {
      this.setState({ items: value })
    }
  }

  saveStateToLocalStorage () {
    localStorage.setItem('list', JSON.stringify(this.state.items))
  }

  onSortStart ({ index }) {
    this.setState({ sortingItem: index })
  }

  onSortEnd ({ oldIndex, newIndex }) {
    const items = arrayMove(this.state.items, oldIndex, newIndex)
    this.setState({ items, sortingItem: null })
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
        <AppBar position='static' className='mb-5'>
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
            onSortStart={this.onSortStart}
            sortingItemIndex={this.state.sortingItem}
          />
        </div>
        {this.state.isModalOpen === false &&
          <Button
            variant='fab'
            color='primary'
            aria-label='Add'
            onClick={this.handleOpen}
            style={{
              position: 'fixed',
              bottom: 26,
              right: 26
            }}
          >
            <AddIcon />
          </Button>
        }

        <Modal open={this.state.isModalOpen} onClose={this.handleClose}>
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
            width: 'calc(100% - 100px)',
            maxWidth: 600,
            margin: '50px auto',
            padding: 32
          }}>
            <Typography variant='title'>Add to list</Typography>
            <Typography variant='body2'>You can add many by spliting them into multiple lines</Typography>
            <TextField
              rows='7'
              multiline
              fullWidth
              onChange={(e) => this.setState({ textarea: e.target.value })}
              value={this.state.textarea}
            />
            <div className='text-right'>
              <Button className='mt-3' variant='contained' color='primary' onClick={() => {
                const newItems = this.state.textarea.replace('\r', '').split('\n').map(strItem => ({
                  id: makeId(),
                  text: strItem,
                  checked: false
                }))
                this.setState({
                  items: [...this.state.items, ...newItems],
                  isModalOpen: false,
                  textarea: ''
                })
              }}>
                Add them
              </Button>
            </div>
          </div>
        </Modal>
      </MuiThemeProvider>
    )
  }
}

export default App

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const makeId = (length = 10) => (
  Array(length).join().split(',').map(() => (
    ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  )).join('')
)
