import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { SortableElement } from 'react-sortable-hoc'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  MenuItem,
  Menu,
  Checkbox,
  Paper,
  Grid,
  TextField,
  Button
} from '@material-ui/core'
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@material-ui/icons'

const ItemItem = ({ item, isItemActive, onCheck, onEdit, onDelete }) => {
  const [editingItem, setEditingItem] = React.useState(false)
  const [editingText, setEditingText] = React.useState('')
  const [itemMenuAnchorEl, setItemMenuAnchorEl] = React.useState(null)

  const itemMenuOpen = Boolean(itemMenuAnchorEl)

  return (
    <ListItem
      className='mb-4'
      component={Paper}
      elevation={isItemActive ? 4 : 1}
      style={{ opacity: item.checked ? 0.6 : 1 }}
    >
      {!editingItem &&
      <Fragment>
        <ListItemText
          primary={
            <Fragment>
              <Checkbox checked={item.checked} color='primary' />
              <span style={{ fontWeight: 'bold', userSelect: 'none', textDecoration: (item.checked ? 'line-through' : 'none') }}>{item.text}</span>
            </Fragment>
          }
          onClick={() => onCheck(item.id)}
        />
        <IconButton
          aria-label='item options'
          aria-owns={itemMenuOpen ? 'item-menu' : null}
          aria-haspopup='true'
          onClick={(e) => setItemMenuAnchorEl(e.currentTarget)}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id='item-menu'
          anchorEl={itemMenuAnchorEl}
          open={itemMenuOpen}
          onClose={() => setItemMenuAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            setEditingItem(true)
            setEditingText(item.text)
            setItemMenuAnchorEl(null)
          }}>
            <ListItemIcon><EditIcon /></ListItemIcon>
            <ListItemText inset primary='Edit' />
          </MenuItem>
          <MenuItem onClick={() => onDelete(item.id)}>
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText inset primary='Delete' />
          </MenuItem>
        </Menu>
      </Fragment>
      }
      {editingItem &&
        <Grid container className='d-block d-sm-flex'>
          <Grid item style={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              autoFocus
              onChange={(e) => setEditingText(e.target.value)}
              value={editingText}
            />
          </Grid>
          <Grid item className='mt-3 mt-sm-0'>
            <Button className='ml-2' variant='contained' size='small' color='primary' onClick={() => {
              onEdit(item.id, editingText)
              setEditingItem(false)
              setEditingText('')
            }}>
              <CheckIcon style={{ fontSize: 20 }} />
              <span className='d-none d-sm-block ml-1'>Save</span>
            </Button>
            <Button className='ml-2' variant='contained' size='small' onClick={() => {
              setEditingItem(false)
              setEditingText('')
            }}>
              <CloseIcon style={{ fontSize: 20 }} />
              <span className='d-none d-sm-block ml-1'>Cancel</span>
            </Button>
          </Grid>
        </Grid>
      }
    </ListItem>
  )
}

ItemItem.propTypes = {
  item: PropTypes.object.isRequired,
  isItemActive: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

ItemItem.defaultProps = {
}

export default SortableElement(ItemItem)
