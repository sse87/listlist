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
  Paper
} from '@material-ui/core'
import {
  Reorder as ReorderIcon,
  DragHandle as DragHandleIcon,
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon
} from '@material-ui/icons'

class ItemItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      anchorEl: null
    }
  }

  render () {
    const { item, isItemActive, onCheck, onDelete, deleteMode } = this.props
    const open = Boolean(this.state.anchorEl)

    return (
      <ListItem
        className='mb-4'
        component={Paper}
        elevation={isItemActive ? 4 : 1}
        style={{ opacity: item.checked ? 0.6 : 1 }}
      >
        <ListItemText
          primary={
            <Fragment>
              <Checkbox checked={item.checked} color='primary' />
              <span style={{ fontWeight: 'bold', textDecoration: (item.checked ? 'line-through' : 'none') }}>{item.text}</span>
            </Fragment>
          }
          onClick={() => onCheck(item.id)}
        />
        {!deleteMode &&
          <DragHandle />
        }
        {deleteMode &&
          <IconButton
            aria-label='delete'
            aria-owns={open ? 'item-menu' : null}
            aria-haspopup='true'
            onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
          >
            <DeleteIcon />
          </IconButton>
        }
        <Menu id='item-menu' anchorEl={this.state.anchorEl} open={open} onClose={() => this.setState({ anchorEl: null })}>
          <MenuItem onClick={() => onDelete(item.id)}>Are you sure?</MenuItem>
        </Menu>
      </ListItem>
    )
  }
}

ItemItem.propTypes = {
  item: PropTypes.object.isRequired,
  isItemActive: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  deleteMode: PropTypes.bool
}

ItemItem.defaultProps = {
  deleteMode: false
}

export default SortableElement(ItemItem)

// This can be any component you want
const randNumber = Math.floor(Math.random() * Math.floor(3))
const DragHandle = SortableHandle(() => {
  if (randNumber === 0) return <ReorderIcon />
  if (randNumber === 1) return <DragHandleIcon />
  return <DragIndicatorIcon />
})
