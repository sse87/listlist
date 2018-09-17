/* globals localStorage, alert */
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
  ListItemText,
  Snackbar
} from '@material-ui/core'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  DeleteSweep as DeleteSweepIcon
} from '@material-ui/icons'
import { arrayMove } from 'react-sortable-hoc'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import ListList from './components/ListList'
import {
  makeId,
  getShareLink,
  parseItems,
  getQueryVariable
} from './utilityFunctions'

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
      modalAddItemsOpen: false,
      textareaAddItems: '',
      appMenuAnchorEl: null,
      appDeleteMode: false,
      confirmCounterdeleteAllChecked: 0,
      confirmCounterdeleteAllItems: 0,
      snackbarOpen: false
    }

    this.loadStateFromLocalStorage = this.loadStateFromLocalStorage.bind(this)
    this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this)
    this.checkForImports = this.checkForImports.bind(this)
    this.onSortStart = this.onSortStart.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onDeleteAllChecked = this.onDeleteAllChecked.bind(this)
    this.onDeleteAllItems = this.onDeleteAllItems.bind(this)
  }

  componentDidMount () {
    this.loadStateFromLocalStorage().then(() => {
      this.checkForImports()
    })
  }

  loadStateFromLocalStorage () {
    return new Promise(resolve => {
      // Parse the localStorage json string to hopefully an array and update the state
      const items = JSON.parse(localStorage.getItem('list'))
      if (Array.isArray(items)) {
        this.setState({ items }, () => resolve())
      } else {
        resolve()
      }
    })
  }

  saveStateToLocalStorage () {
    return new Promise(resolve => {
      localStorage.setItem('list', JSON.stringify(this.state.items))
      resolve()
    })
  }

  // Still under construction
  checkForImports () {
    const importString = getQueryVariable('import')
    if (importString !== false) {
      console.log('importString:', importString)
      console.log('parseItems:', parseItems(importString))
      const newItems = parseItems(importString)
      if (this.state.items.length === 0 && Array.isArray(newItems)) {
        console.log('Item loaded from import string')
        this.setState({ items: newItems }, () => {
          this.saveStateToLocalStorage().then(() => {
            // Refresh and drop all query variables like '?import=YTB8...'
            window.location.href = `${window.location.origin}${window.location.pathname}`
          })
        })
      }
    }
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
    this.overwriteItems(items)
  }

  onDelete (id) {
    const items = this.state.items.filter(item => item.id !== id)
    this.overwriteItems(items)
  }

  onDeleteAllChecked () {
    const items = this.state.items.filter(item => !item.checked)
    this.overwriteItems(items)
  }

  onDeleteAllItems () {
    this.overwriteItems([])
  }

  overwriteItems (newItems) {
    this.setState({ items: newItems }, () => {
      this.saveStateToLocalStorage()
    })
  }

  render () {
    const {
      items,
      sortingItem,
      modalAddItemsOpen,
      textareaAddItems,
      appMenuAnchorEl,
      appDeleteMode,
      confirmCounterdeleteAllChecked,
      confirmCounterdeleteAllItems,
      snackbarOpen
    } = this.state

    const menuAppOpen = Boolean(appMenuAnchorEl)

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position='static' className='mb-5'>
          <Toolbar>
            <Typography variant='title' color='inherit' style={{ flexGrow: 1 }}>List List</Typography>
            <IconButton
              aria-label='options'
              aria-owns={menuAppOpen ? 'app-options' : null}
              aria-haspopup='true'
              onClick={(e) => this.setState({ appMenuAnchorEl: e.currentTarget })}
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
            appDeleteMode={appDeleteMode}
          />
        </div>
        {modalAddItemsOpen === false &&
          <Button
            variant='fab'
            color='primary'
            aria-label='add'
            onClick={() => this.setState({ modalAddItemsOpen: true })}
            style={{ position: 'fixed', bottom: 26, right: 26 }}
          >
            <AddIcon />
          </Button>
        }
        <Menu
          id='app-options'
          anchorEl={appMenuAnchorEl}
          open={menuAppOpen}
          onClose={() => this.setState({ appMenuAnchorEl: null })}
          onExited={() => this.setState({ confirmCounterdeleteAllItems: 0 })}
        >
          <CopyToClipboard
            text={getShareLink(this.state.items)}
            onCopy={(text, result) => {
              if (text !== '' && result) {
                this.setState({ snackbarOpen: true, appMenuAnchorEl: null })
              } else {
                console.log('ERROR - CopyToClipboard.onCopy() - (text, result):', text, result)
                // TODO: Handle this better, drop the alert and display model with message and link so it can be copied manually
                alert('Some error occurred when copying to clipboard but here is the link:\n' + getShareLink(this.state.items))
              }
            }}
          >
            <MenuItem>
              <ListItemIcon><ShareIcon /></ListItemIcon>
              <ListItemText inset primary='Copy share link' />
            </MenuItem>
          </CopyToClipboard>
          <MenuItem onClick={() => this.setState({ appDeleteMode: !appDeleteMode, appMenuAnchorEl: null })}>
            {!appDeleteMode && <ListItemIcon><DeleteOutlinedIcon /></ListItemIcon>}
            {appDeleteMode && <ListItemIcon><DeleteIcon /></ListItemIcon>}
            <ListItemText inset primary={`${appDeleteMode ? 'Hide' : 'Show'} delete buttons`} />
          </MenuItem>
          <MenuItem onClick={() => {
            if (confirmCounterdeleteAllChecked === 2) {
              this.onDeleteAllChecked()
              this.setState({ confirmCounterdeleteAllChecked: 0, appMenuAnchorEl: null })
            } else {
              this.setState({ confirmCounterdeleteAllChecked: (confirmCounterdeleteAllChecked + 1) })
            }
          }}>
            <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
            <ListItemText inset primary={
              confirmCounterdeleteAllChecked === 0 ? 'Delete checked' : confirmCounterdeleteAllChecked === 1 ? 'Are you sure?' : 'Are you sure sure?'
            } />
          </MenuItem>
          <MenuItem onClick={() => {
            if (confirmCounterdeleteAllItems === 2) {
              this.onDeleteAllItems()
              this.setState({ confirmCounterdeleteAllItems: 0, appMenuAnchorEl: null })
            } else {
              this.setState({ confirmCounterdeleteAllItems: (confirmCounterdeleteAllItems + 1) })
            }
          }}>
            <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
            <ListItemText inset primary={
              confirmCounterdeleteAllItems === 0 ? 'Delete all' : confirmCounterdeleteAllItems === 1 ? 'Are you sure?' : 'Are you sure sure?'
            } />
          </MenuItem>
        </Menu>
        <Modal open={modalAddItemsOpen} onClose={() => this.setState({ modalAddItemsOpen: false })}>
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
              autoFocus
              onChange={(e) => this.setState({ textareaAddItems: e.target.value })}
              value={textareaAddItems}
            />
            <div className='text-right'>
              <Button className='mt-3' variant='contained' color='primary' onClick={() => {
                // Convert list items from being a string to an object
                const newItems = textareaAddItems.trim().replace('\r', '').split('\n').map(strItem => ({
                  id: makeId(),
                  text: strItem,
                  checked: false
                }))
                this.setState({
                  items: [...items, ...newItems],
                  modalAddItemsOpen: false,
                  textareaAddItems: ''
                }, () => {
                  this.saveStateToLocalStorage()
                })
              }}>
                Add them
              </Button>
            </div>
          </div>
        </Modal>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={snackbarOpen}
          onClose={(event, reason) => {
            if (reason === 'clickaway') { return }
            this.setState({ snackbarOpen: false })
          }}
          autoHideDuration={2000}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id='message-id'>Link copied!</span>}
        />
      </MuiThemeProvider>
    )
  }
}

export default App
