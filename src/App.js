/* globals localStorage */
import React, { Component } from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import indigo from '@material-ui/core/colors/indigo'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Modal,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  // Share as ShareIcon,
  Delete as DeleteIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  DeleteSweep as DeleteSweepIcon
} from '@material-ui/icons'
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
      textarea: '',
      anchorEl: null,
      deleteMode: false,
      deleteAllCounter: 0
    }

    this.loadStateFromLocalStorage = this.loadStateFromLocalStorage.bind(this)
    this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this)
    this.onSortStart = this.onSortStart.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onDeleteAll = this.onDeleteAll.bind(this)
  }

  componentDidMount () {
    this.loadStateFromLocalStorage()
  }

  loadStateFromLocalStorage () {
    // Parse the localStorage json string to hopefully an array and update the state
    const value = JSON.parse(localStorage.getItem('list'))
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
    this.setState({ items, sortingItem: null }, () => {
      this.saveStateToLocalStorage()
    })
  }

  onCheck (id) {
    const items = this.state.items.map((item) => {
      if (item.id === id) {
        item.checked = !item.checked
      }
      return item
    })
    this.setState({ items }, () => {
      this.saveStateToLocalStorage()
    })
  }

  onDelete (id) {
    const items = this.state.items.filter(item => item.id !== id)
    this.setState({ items }, () => {
      this.saveStateToLocalStorage()
    })
  }

  onDeleteAll () {
    this.setState({ items: [] }, () => {
      this.saveStateToLocalStorage()
    })
  }

  render () {
    const {
      items,
      sortingItem,
      isModalOpen,
      textarea,
      anchorEl,
      deleteMode,
      deleteAllCounter
    } = this.state

    const open = Boolean(anchorEl)

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position='static' className='mb-5'>
          <Toolbar>
            <Typography variant='title' color='inherit' style={{ flexGrow: 1 }}>List List</Typography>
            <IconButton
              aria-label='options'
              aria-owns={open ? 'app-options' : null}
              aria-haspopup='true'
              onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
              color='inherit'
            >
              <MoreVertIcon color='inherit' />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className='container px-0' style={{ paddingBottom: 108 }}>
          <ListList
            items={items}
            sortingItemIndex={sortingItem}
            onSortEnd={this.onSortEnd}
            onCheck={this.onCheck}
            onDelete={this.onDelete}
            onSortStart={this.onSortStart}
            deleteMode={deleteMode}
          />
        </div>
        {isModalOpen === false &&
          <Button
            variant='fab'
            color='primary'
            aria-label='add'
            onClick={() => this.setState({ isModalOpen: true })}
            style={{
              position: 'fixed',
              bottom: 26,
              right: 26
            }}
          >
            <AddIcon />
          </Button>
        }
        <Menu id='app-options' anchorEl={anchorEl} open={open} onClose={() => this.setState({ anchorEl: null })}>
          {/*
          <MenuItem onClick={() => {}}>
            <ListItemIcon><ShareIcon /></ListItemIcon>
            <ListItemText inset primary='Copy share link' />
          </MenuItem>
          */}
          <MenuItem onClick={() => this.setState({ deleteMode: !deleteMode })}>
            {!deleteMode && <ListItemIcon><DeleteIcon /></ListItemIcon>}
            {deleteMode && <ListItemIcon><DeleteOutlinedIcon /></ListItemIcon>}
            <ListItemText inset primary={`${deleteMode ? 'Hide' : 'Show'} delete buttons`} />
          </MenuItem>
          <MenuItem onClick={() => {
            if (deleteAllCounter === 2) {
              this.onDeleteAll()
              this.setState({ deleteAllCounter: 0 })
            } else {
              this.setState({ deleteAllCounter: (deleteAllCounter + 1) })
            }
          }}>
            <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
            <ListItemText inset primary={
              deleteAllCounter === 0 ? 'Delete all' : deleteAllCounter === 1 ? 'Are you sure?' : 'Are you sure sure?'
            } />
          </MenuItem>
        </Menu>
        <Modal open={isModalOpen} onClose={() => this.setState({ isModalOpen: false })}>
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
              value={textarea}
            />
            <div className='text-right'>
              <Button className='mt-3' variant='contained' color='primary' onClick={() => {
                const newItems = textarea.replace('\r', '').split('\n').map(strItem => ({
                  id: makeId(),
                  text: strItem,
                  checked: false
                }))
                this.setState({
                  items: [...items, ...newItems],
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
