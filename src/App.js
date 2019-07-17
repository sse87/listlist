/* globals alert */
import React from 'react'
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
import useLocalStorage from './misc/useLocalStorage'

const theme = createMuiTheme({
  palette: {
    primary: indigo
  },
  typography: {
    useNextVariants: true
  }
})

const App = () => {
  const [items, setItems] = useLocalStorage('list', [])
  const [sortingItem, setSortingItem] = React.useState(null)
  const [modalAddItemsOpen, setModalAddItemsOpen] = React.useState(false)
  const [textareaAddItems, setTextareaAddItems] = React.useState('')
  const [appMenuAnchorEl, setAppMenuAnchorEl] = React.useState(null)
  const [confirmCounterdeleteAllChecked, setConfirmCounterdeleteAllChecked] = React.useState(0)
  const [confirmCounterdeleteAllItems, setConfirmCounterdeleteAllItems] = React.useState(0)
  const [snackbarCopiedConfirmOpen, setSnackbarCopiedConfirmOpen] = React.useState(false)
  const [snackbarDeletedUndoOpen, setSnackbarDeletedUndoOpen] = React.useState(false)
  const [itemsToBeImport, setItemsToBeImport] = React.useState([])
  const [itemsBeforeDeletion, setItemsBeforeDeletion] = React.useState([])

  React.useEffect(() => {
    checkForImports()
    // eslint-disable-next-line
  }, [])

  // TODO: Cleanup console logs
  const checkForImports = () => {
    const importString = getQueryVariable('import')
    // console.log('importString:', importString)
    // If import var isn't set or if it is an empty string
    if (importString === false || importString === '') return

    const newItems = parseItems(importString)
    // console.log('newItems:', newItems)
    // If items is not an array, or the array has 0 items
    if (!Array.isArray(newItems) || newItems.length === 0) return

    // console.log('current list length:', items.length)
    // If the current list is empty
    if (items.length === 0) {
      // console.log('Item loaded from import string')
      setItems(newItems)
      // Refresh and drop all query variables like '?import=YTB8...'
      setTimeout(() => {
        window.location.href = `${window.location.origin}${window.location.pathname}`
      }, 0)
    } else {
      setItemsToBeImport(newItems)
    }
  }

  const onSortStart = ({ index }) => {
    setSortingItem(index)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMove(items, oldIndex, newIndex))
    setSortingItem(null)
  }

  const onAdd = (strItems) => {
    // Convert list items from being a string to an object
    const newItems = strItems.trim().replace('\r', '').split('\n').map(strItem => ({
      id: makeId(),
      text: strItem,
      checked: false
    }))
    // Concat the new items to current items
    overwriteItems([...items, ...newItems])
  }

  const onCheck = (id) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        item.checked = !item.checked
      }
      return item
    })
    overwriteItems(newItems)
  }

  const onEdit = (id, newText) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        item.text = newText
      }
      return item
    })
    overwriteItems(newItems)
  }

  const onDelete = (id) => {
    setItemsBeforeDeletion(items)
    setSnackbarDeletedUndoOpen(true)

    const newItems = items.filter(item => item.id !== id)
    overwriteItems(newItems)
  }

  const onDeleteAllChecked = () => {
    setItemsBeforeDeletion(items)
    setSnackbarDeletedUndoOpen(true)

    const newItems = items.filter(item => !item.checked)
    overwriteItems(newItems)
  }

  const onDeleteAllItems = () => {
    setItemsBeforeDeletion(items)
    setSnackbarDeletedUndoOpen(true)

    overwriteItems([])
  }

  const onUndoDeletion = () => {
    overwriteItems(itemsBeforeDeletion).then(() => {
      setItemsBeforeDeletion([])
    })
  }

  const overwriteItems = (newItems) => {
    return new Promise(resolve => {
      setItems(newItems)
      resolve()
    })
  }

  const handleImportConflictClose = () => {
    // Empty itemsToBeImport then drop all query variables
    setItemsToBeImport([])
    setTimeout(() => {
      window.location.href = `${window.location.origin}${window.location.pathname}`
    }, 0)
  }

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
            onClick={(e) => setAppMenuAnchorEl(e.currentTarget)}
            color='inherit'
          >
            <MoreVertIcon color='inherit' />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className='container px-0' style={{ paddingBottom: 108 }}>
        {items.length === 0 &&
          <>
            <p className='text-center p-3'>Your list is empty! You can easily add items to it by pressing the button below</p>
            <Zoom in={!modalAddItemsOpen}>
              <p className='text-center'>
                <Button
                  variant='contained'
                  color='primary'
                  aria-label='add'
                  onClick={() => setModalAddItemsOpen(true)}
                >
                  Add items
                </Button>
              </p>
            </Zoom>
          </>
        }
        {items.length > 0 &&
          <ListList
            items={items}
            sortingItemIndex={sortingItem}
            onSortEnd={onSortEnd}
            onCheck={onCheck}
            onEdit={onEdit}
            onDelete={onDelete}
            onSortStart={onSortStart}
          />
        }
      </div>
      <Zoom in={!modalAddItemsOpen}>
        <Fab
          color='primary'
          aria-label='add'
          onClick={() => setModalAddItemsOpen(true)}
          style={{ position: 'fixed', bottom: 26, right: 26 }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
      <Menu
        id='app-options'
        anchorEl={appMenuAnchorEl}
        open={menuAppOpen}
        onClose={() => setAppMenuAnchorEl(null)}
        onExited={() => setConfirmCounterdeleteAllItems(0)}
      >
        <CopyToClipboard
          text={getShareLink(items)}
          onCopy={(text, result) => {
            if (text !== '' && result) {
              setSnackbarCopiedConfirmOpen(true)
              setAppMenuAnchorEl(null)
            } else {
              console.log('ERROR - CopyToClipboard.onCopy() - (text, result):', text, result)
              // TODO: Handle this better, drop the alert and display model with message and link so it can be copied manually
              alert('Some error occurred when copying to clipboard but here is the link:\n' + getShareLink(items))
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
              onDeleteAllChecked()
              setConfirmCounterdeleteAllChecked(0)
              setAppMenuAnchorEl(null)
            } else {
              setConfirmCounterdeleteAllChecked(confirmCounterdeleteAllChecked + 1)
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
            onDeleteAllItems()
            setConfirmCounterdeleteAllItems(0)
            setAppMenuAnchorEl(null)
          } else {
            setConfirmCounterdeleteAllItems(confirmCounterdeleteAllItems + 1)
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
        onClose={() => setModalAddItemsOpen(false)}
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
            onChange={(e) => setTextareaAddItems(e.target.value)}
            value={textareaAddItems}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={() => {
            onAdd(textareaAddItems)
            setModalAddItemsOpen(false)
            setTextareaAddItems('')
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
          setSnackbarCopiedConfirmOpen(false)
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
          setSnackbarDeletedUndoOpen(false)
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
              onUndoDeletion()
              setSnackbarDeletedUndoOpen(false)
            }}
          >
            Undo
          </Button>,
          <IconButton
            key='close'
            aria-label='Close'
            color='inherit'
            onClick={() => setSnackbarDeletedUndoOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      <Dialog
        open={modalImportConflictOpen}
        onClose={handleImportConflictClose}
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
            overwriteItems([...items, ...itemsToBeImport]).then(() => {
              handleImportConflictClose()
            })
          }}>
            Merge
          </Button>
          <Button variant='contained' color='secondary' onClick={() => {
            overwriteItems(itemsToBeImport).then(() => {
              handleImportConflictClose()
            })
          }}>
            Overwrite
          </Button>
          <Button variant='contained' color='default' style={{ position: 'absolute', left: 4 }} onClick={() => {
            handleImportConflictClose()
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </MuiThemeProvider>
  )
}

export default App
