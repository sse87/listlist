import React from 'react'
import PropTypes from 'prop-types'
import { SortableContainer } from 'react-sortable-hoc'
import List from '@material-ui/core/List'

import ItemItem from '../ItemItem'

const ListList = ({ items, onSortStart, onSortEnd, onCheck, onDelete, sortingItemIndex }) => {
  return (
    <SortableList
      items={items}
      onSortStart={onSortStart}
      onSortEnd={onSortEnd}
      onCheck={onCheck}
      onDelete={onDelete}
      lockAxis='y'
      useDragHandle
      useWindowAsScrollContainer
      sortingItemIndex={sortingItemIndex}
    />
  )
}

ListList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onSortStart: PropTypes.func.isRequired,
  onSortEnd: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  sortingItemIndex: PropTypes.number.isRequired
}

ListList.defaultProps = {
  items: []
}

export default ListList

// Wrapper
const SortableList = SortableContainer(({ items, onCheck, onDelete, sortingItemIndex }) => (
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
        activeItem={sortingItemIndex === index}
      />
    ))}
  </List>
))
