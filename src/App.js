/* globals localStorage, alert */
import React, { Component, Fragment } from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import indigo from '@material-ui/core/colors/indigo'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Fab,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core'
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  DeleteSweep as DeleteSweepIcon,
  Close as CloseIcon
} from '@material-ui/icons'
import { arrayMove } from 'react-sortable-hoc'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import ListList from './components/ListList'
import {
  makeId,
  getShareLink,
  parseItems,
  getQueryVariable,
  pluralItems
} from './utilityFunctions'

const theme = createMuiTheme({
  palette: {
    primary: indigo
  },
  typography: {
    useNextVariants: true
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
      confirmCounterdeleteAllChecked: 0,
      confirmCounterdeleteAllItems: 0,
      snackbarCopiedConfirmOpen: false,
      snackbarDeletedUndoOpen: false,
      itemsToBeImport: [],
      itemsBeforeDeletion: []
    }

    this.loadStateFromLocalStorage = this.loadStateFromLocalStorage.bind(this)
    this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this)
    this.checkForImports = this.checkForImports.bind(this)
    this.onSortStart = this.onSortStart.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
    this.onAdd = this.onAdd.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onEdit = this.onEdit.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onDeleteAllChecked = this.onDeleteAllChecked.bind(this)
    this.onDeleteAllItems = this.onDeleteAllItems.bind(this)
    this.handleImportConflictClose = this.handleImportConflictClose.bind(this)
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

  // TODO: Cleanup console logs
  checkForImports () {
    const importString = getQueryVariable('import')
    // console.log('importString:', importString)
    if (importString === false || importString === '') return

    const newItems = parseItems(importString)
    // console.log('newItems:', newItems)
    if (!Array.isArray(newItems) || newItems.length === 0) return

    // console.log('current list length:', this.state.items.length)
    if (this.state.items.length === 0) {
      // console.log('Item loaded from import string')
      this.setState({ items: newItems }, () => {
        this.saveStateToLocalStorage().then(() => {
          // Refresh and drop all query variables like '?import=YTB8...'
          window.location.href = `${window.location.origin}${window.location.pathname}`
        })
      })
    } else {
      this.setState({ itemsToBeImport: newItems })
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

  onAdd (strItems) {
    // Convert list items from being a string to an object
    const newItems = strItems.trim().replace('\r', '').split('\n').map(strItem => ({
      id: makeId(),
      text: strItem,
      checked: false
    }))
    // Concat the new items to current items
    this.overwriteItems([...this.state.items, ...newItems])
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

  onEdit (id, newText) {
    const items = this.state.items.map((item) => {
      if (item.id === id) {
        item.text = newText
      }
      return item
    })
    this.overwriteItems(items)
  }

  onDelete (id) {
    this.setState({
      itemsBeforeDeletion: this.state.items,
      snackbarDeletedUndoOpen: true
    }, () => {
      const items = this.state.items.filter(item => item.id !== id)
      this.overwriteItems(items)
    })
  }

  onDeleteAllChecked () {
    this.setState({
      itemsBeforeDeletion: this.state.items,
      snackbarDeletedUndoOpen: true
    }, () => {
      const items = this.state.items.filter(item => !item.checked)
      this.overwriteItems(items)
    })
  }

  onDeleteAllItems () {
    this.setState({
      itemsBeforeDeletion: this.state.items,
      snackbarDeletedUndoOpen: true
    }, () => {
      this.overwriteItems([])
    })
  }

  onUndoDeletion () {
    this.overwriteItems(this.state.itemsBeforeDeletion).then(() => {
      this.setState({ itemsBeforeDeletion: [] })
    })
  }

  overwriteItems (newItems) {
    return new Promise(resolve => {
      this.setState({ items: newItems }, () => {
        this.saveStateToLocalStorage().then(() => {
          resolve()
        })
      })
    })
  }

  handleImportConflictClose () {
    // Empty itemsToBeImport then drop all query variables
    this.setState({ itemsToBeImport: [] }, () => {
      window.location.href = `${window.location.origin}${window.location.pathname}`
    })
  }

  render () {
    const {
      items,
      sortingItem,
      modalAddItemsOpen,
      textareaAddItems,
      appMenuAnchorEl,
      confirmCounterdeleteAllChecked,
      confirmCounterdeleteAllItems,
      snackbarCopiedConfirmOpen,
      snackbarDeletedUndoOpen,
      itemsToBeImport,
      itemsBeforeDeletion
    } = this.state

    const menuAppOpen = Boolean(appMenuAnchorEl)
    const modalImportConflictOpen = itemsToBeImport.length > 0
    const isAnyItemsChecked = items.some(item => item.checked)

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position='static' className='mb-5'>
          <Toolbar>
            <Typography
              variant='h6'
              color='inherit'
              style={{ flexGrow: 1 }}
              title={`Version ${window.appVersion}`}
            >List List</Typography>
            <IconButton
              aria-label='app options'
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
          {items.length === 0 &&
            <Fragment>
              <p className='text-center p-3'>Your list is empty! You can easily add items to it by pressing the button below</p>
              <Zoom in={!modalAddItemsOpen}>
                <p className='text-center'>
                  <Button
                    variant='contained'
                    color='primary'
                    aria-label='add'
                    onClick={() => this.setState({ modalAddItemsOpen: true })}
                  >
                    Add items
                  </Button>
                </p>
              </Zoom>
            </Fragment>
          }
          {items.length > 0 &&
            <ListList
              items={items}
              sortingItemIndex={sortingItem}
              onSortEnd={this.onSortEnd}
              onCheck={this.onCheck}
              onEdit={this.onEdit}
              onDelete={this.onDelete}
              onSortStart={this.onSortStart}
            />
          }
        </div>
        <Zoom in={!modalAddItemsOpen}>
          <Fab
            color='primary'
            aria-label='add'
            onClick={() => this.setState({ modalAddItemsOpen: true })}
            style={{ position: 'fixed', bottom: 26, right: 26 }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
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
                this.setState({ snackbarCopiedConfirmOpen: true, appMenuAnchorEl: null })
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
          {isAnyItemsChecked &&
            <MenuItem onClick={() => {
              if (confirmCounterdeleteAllChecked === 1) {
                this.onDeleteAllChecked()
                this.setState({ confirmCounterdeleteAllChecked: 0, appMenuAnchorEl: null })
              } else {
                this.setState({ confirmCounterdeleteAllChecked: (confirmCounterdeleteAllChecked + 1) })
              }
            }}>
              <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
              <ListItemText inset primary={
                confirmCounterdeleteAllChecked === 0 ? 'Delete all checked' : 'Are you sure?'
              } />
            </MenuItem>
          }
          <MenuItem onClick={() => {
            if (confirmCounterdeleteAllItems === 1) {
              this.onDeleteAllItems()
              this.setState({ confirmCounterdeleteAllItems: 0, appMenuAnchorEl: null })
            } else {
              this.setState({ confirmCounterdeleteAllItems: (confirmCounterdeleteAllItems + 1) })
            }
          }}>
            <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
            <ListItemText inset primary={
              confirmCounterdeleteAllItems === 0 ? 'Delete all' : 'Are you sure?'
            } />
          </MenuItem>
        </Menu>
        <Dialog
          open={modalAddItemsOpen}
          onClose={() => this.setState({ modalAddItemsOpen: false })}
          aria-labelledby='dialog-title'
          aria-describedby='dialog-description'
        >
          <DialogTitle id='dialog-title'>Add to list</DialogTitle>
          <DialogContent>
            <DialogContentText id='dialog-description'>
              You can add many by spliting them into multiple lines
            </DialogContentText>
            <TextField
              rows='7'
              multiline
              fullWidth
              autoFocus
              onChange={(e) => this.setState({ textareaAddItems: e.target.value })}
              value={textareaAddItems}
            />
          </DialogContent>
          <DialogActions>
            <Button variant='contained' color='primary' onClick={() => {
              this.onAdd(textareaAddItems)
              this.setState({ modalAddItemsOpen: false, textareaAddItems: '' })
            }}>
              Add them
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={snackbarCopiedConfirmOpen}
          onClose={(event, reason) => {
            if (reason === 'clickaway') return
            this.setState({ snackbarCopiedConfirmOpen: false })
          }}
          autoHideDuration={2000}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id='message-id'>Link copied!</span>}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={snackbarDeletedUndoOpen}
          onClose={(event, reason) => {
            if (reason === 'clickaway') return
            this.setState({ snackbarDeletedUndoOpen: false })
          }}
          autoHideDuration={4000}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id='message-id'>{pluralItems(itemsBeforeDeletion.length - items.length)} have been deleted</span>}
          action={[
            <Button
              key='undo'
              variant='contained'
              color='secondary'
              size='small'
              onClick={() => {
                this.onUndoDeletion()
                this.setState({ snackbarDeletedUndoOpen: false })
              }}
            >
              Undo
            </Button>,
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              onClick={() => this.setState({ snackbarDeletedUndoOpen: false })}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
        <Dialog
          open={modalImportConflictOpen}
          onClose={this.handleImportConflictClose}
          aria-labelledby='dialog-title'
          aria-describedby='dialog-description'
        >
          <DialogTitle id='dialog-title'>Import conflict detected</DialogTitle>
          <DialogContent>
            <DialogContentText id='dialog-description'>
            You are trying to import {pluralItems(itemsToBeImport.length)} but there are already {pluralItems(items.length)} on your list. What do you want to do?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' color='primary' onClick={() => {
              this.overwriteItems([...items, ...itemsToBeImport]).then(() => {
                this.handleImportConflictClose()
              })
            }}>
              Merge
            </Button>
            <Button variant='contained' color='secondary' onClick={() => {
              this.overwriteItems(itemsToBeImport).then(() => {
                this.handleImportConflictClose()
              })
            }}>
              Overwrite
            </Button>
            <Button variant='contained' color='default' style={{ position: 'absolute', left: 4 }} onClick={() => {
              this.handleImportConflictClose()
            }}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </MuiThemeProvider>
    )
  }
}

export default App
