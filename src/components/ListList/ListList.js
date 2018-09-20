import React from 'react'
import PropTypes from 'prop-types'
import { SortableContainer } from 'react-sortable-hoc'
import List from '@material-ui/core/List'

import ItemItem from '../ItemItem'

const ListList = ({ items, sortingItemIndex, onCheck, onEdit, onDelete, onSortStart, onSortEnd }) => {
  return (
    <SortableList
      items={items}
      sortingItemIndex={sortingItemIndex}
      onCheck={onCheck}
      onEdit={onEdit}
      onDelete={onDelete}
      onSortStart={onSortStart}
      onSortEnd={onSortEnd}
      lockAxis='y'
      useWindowAsScrollContainer
      transitionDuration={600}
      pressDelay={100}
      helperClass='item--active'
    />
  )
}

ListList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  sortingItemIndex: PropTypes.number,
  onCheck: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSortStart: PropTypes.func.isRequired,
  onSortEnd: PropTypes.func.isRequired
}

ListList.defaultProps = {
  items: [],
  sortingItemIndex: null
}

export default ListList

// Wrapper
const SortableList = SortableContainer(({ items, sortingItemIndex, onCheck, onEdit, onDelete }) => (
  <List style={{ padding: 0 }}>
    {items.map((item, index) => (
      <ItemItem
        key={`item-${item.id}`}
        index={index}
        item={item}
        isItemActive={sortingItemIndex === index}
        onCheck={onCheck}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </List>
))
