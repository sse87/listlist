import React from 'react'
import PropTypes from 'prop-types'
import { SortableContainer } from 'react-sortable-hoc'
import List from '@material-ui/core/List'

import ItemItem from '../ItemItem'

const ListList = ({ items, onSortEnd, onCheck, onDelete }) => {
  return (
    <SortableList
      items={items}
      onSortEnd={onSortEnd}
      onCheck={onCheck}
      onDelete={onDelete}
      lockAxis='y'
      useDragHandle
      useWindowAsScrollContainer
    />
  )
}

ListList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onSortEnd: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

ListList.defaultProps = {
  items: []
}

export default ListList

// Wrapper
const SortableList = SortableContainer(({ items, onCheck, onDelete }) => (
  <List style={{ padding: 0 }}>
    {items.length === 0 &&
      <p className='text-center'>The list is empty :'(</p>
    }
    {items.map((item, index) => (
      <ItemItem
        key={`item-${item.id}`}
        index={index}
        item={item}
        onCheck={onCheck}
        onDelete={onDelete}
      />
    ))}
  </List>
))