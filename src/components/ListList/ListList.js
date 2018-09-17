import React from 'react'
import PropTypes from 'prop-types'
import { SortableContainer } from 'react-sortable-hoc'
import List from '@material-ui/core/List'

import ItemItem from '../ItemItem'

const ListList = ({ items, sortingItemIndex, onCheck, onDelete, onSortStart, onSortEnd, appDeleteMode }) => {
  return (
    <SortableList
      items={items}
      sortingItemIndex={sortingItemIndex}
      onCheck={onCheck}
      onDelete={onDelete}
      onSortStart={onSortStart}
      onSortEnd={onSortEnd}
      appDeleteMode={appDeleteMode}
      lockAxis='y'
      useDragHandle
      useWindowAsScrollContainer
    />
  )
}

ListList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  sortingItemIndex: PropTypes.number,
  onCheck: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSortStart: PropTypes.func.isRequired,
  onSortEnd: PropTypes.func.isRequired,
  appDeleteMode: PropTypes.bool
}

ListList.defaultProps = {
  items: [],
  sortingItemIndex: null,
  appDeleteMode: false
}

export default ListList

// Wrapper
const SortableList = SortableContainer(({ items, sortingItemIndex, onCheck, onDelete, appDeleteMode }) => (
  <List style={{ padding: 0 }}>
    {items.length === 0 &&
      <p className='text-center'>The list is empty :'(</p>
    }
    {items.map((item, index) => (
      <ItemItem
        key={`item-${item.id}`}
        index={index}
        item={item}
        isItemActive={sortingItemIndex === index}
        onCheck={onCheck}
        onDelete={onDelete}
        appDeleteMode={appDeleteMode}
      />
    ))}
  </List>
))
