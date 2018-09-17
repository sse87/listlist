import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  SortableElement,
  SortableHandle
} from 'react-sortable-hoc'
import {
  ListItem,
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
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@material-ui/icons'

class ItemItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editingItem: false,
      editingText: '',
      deleteConfirmAnchorEl: null
    }
  }

  render () {
    const { item, isItemActive, onCheck, onEdit, onDelete, appEditMode } = this.props
    const { editingItem, editingText, deleteConfirmAnchorEl } = this.state

    const deleteConfirmOpen = Boolean(deleteConfirmAnchorEl)

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
                <span style={{ fontWeight: 'bold', textDecoration: (item.checked ? 'line-through' : 'none') }}>{item.text}</span>
              </Fragment>
            }
            onClick={() => onCheck(item.id)}
          />
          {!appEditMode &&
            <DragHandle />
          }
          {appEditMode &&
            <Fragment>
              <IconButton
                aria-label='edit'
                onClick={() => this.setState({ editingItem: true, editingText: item.text })}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label='delete'
                aria-owns={deleteConfirmOpen ? 'item-menu' : null}
                aria-haspopup='true'
                onClick={(e) => this.setState({ deleteConfirmAnchorEl: e.currentTarget })}
              >
                <DeleteIcon />
              </IconButton>
            </Fragment>
          }
          <Menu
            id='item-menu'
            anchorEl={deleteConfirmAnchorEl}
            open={deleteConfirmOpen}
            onClose={() => this.setState({ deleteConfirmAnchorEl: null })}
          >
            <MenuItem onClick={() => onDelete(item.id)}>Are you sure?</MenuItem>
          </Menu>
        </Fragment>
        }
        {editingItem &&
          <Grid container>
            <Grid item style={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                autoFocus
                onChange={(e) => this.setState({ editingText: e.target.value })}
                value={editingText}
              />
            </Grid>
            <Grid item>
              <Button className='ml-3' variant='contained' size='small' color='primary' onClick={() => {
                onEdit(item.id, editingText)
                this.setState({ editingItem: false, editingText: '' })
              }}>
                <SaveIcon className='mr-2' style={{ fontSize: 20 }} />
                Save
              </Button>
            </Grid>
          </Grid>
        }
      </ListItem>
    )
  }
}
// onEdit(item.id)

ItemItem.propTypes = {
  item: PropTypes.object.isRequired,
  isItemActive: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  appEditMode: PropTypes.bool
}

ItemItem.defaultProps = {
  appEditMode: false
}

export default SortableElement(ItemItem)

// This can be any component you want
const DragHandle = SortableHandle(() => <DragIndicatorIcon className='cursor-grab' />)
