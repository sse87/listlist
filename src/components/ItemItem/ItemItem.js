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
  Checkbox
} from '@material-ui/core'
import {
  Reorder as ReorderIcon,
  Delete as DeleteIcon
} from '@material-ui/icons'
import indigo from '@material-ui/core/colors/indigo'

class ItemItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      anchorEl: null
    }

    this.handleClose = this.handleClose.bind(this)
  }

  handleClose () {
    this.setState({ anchorEl: null })
  }

  render () {
    const { item, onCheck, onDelete } = this.props
    const open = Boolean(this.state.anchorEl)
    return (
      <ListItem style={{ backgroundColor: indigo[50] }}>
        <DragHandle />
        <ListItemText
          primary={
            <Fragment>
              <Checkbox checked={item.checked} />
              <span style={{ fontWeight: 'bold' }}>{item.text}</span>
            </Fragment>
          }
          onClick={() => onCheck(item.id)}
        />
        <IconButton
          aria-label='More'
          aria-owns={open ? 'item-menu' : null}
          aria-haspopup='true'
          onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
        >
          <DeleteIcon />
        </IconButton>
        <Menu id='item-menu' anchorEl={this.state.anchorEl} open={open} onClose={this.handleClose}>
          <MenuItem onClick={() => onDelete(item.id)}>Are you sure?</MenuItem>
        </Menu>
      </ListItem>
    )
  }
}

ItemItem.propTypes = {
  item: PropTypes.object.isRequired,
  onCheck: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

ItemItem.defaultProps = {
}

export default SortableElement(ItemItem)

// This can be any component you want
const DragHandle = SortableHandle(() => <ReorderIcon />)