/* globals btoa, atob */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export const makeId = (length = 10) => (
  Array(length).join().split(',').map(() => (
    ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  )).join('')
)

// Replace non-url-safe characters to more safe ones, replacing '+', '/' and '=' to '.', '_' and '-' respectively
const makeBase64UrlSafe = str => str.replace('+', '.').replace('/', '_').replace('=', '-')
// Replace the saem url-safe characters back to standard base64 characters
const makeUrlBase64Safe = str => str.replace('.', '+').replace('_', '/').replace('-', '=')
// Base64 characters are 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' and = for padding
// Last 3 are not safe for URLs

export const stringifyItems = (items) => (
  // Before base64 encoded, each item will be minimized like this:
  // 'Make to do list1|Realize you've already accomplished 2 things1|Check off first thing on to do list1|Reward yourself with nap0'
  makeBase64UrlSafe(btoa(items.reduce((acc, curr) => (
    acc += `|${curr.text}${curr.checked ? '1' : '0'}`
  ), '').substr(1)))
)

export const getShareLink = (items) => (
  `${window.location.origin}${window.location.pathname}${items.length > 0 ? `?import=${stringifyItems(items)}` : ''}`
)

export const parseItems = (strItems) => {
  const delimiter = '{{proper_delimiter}}'
  strItems = makeUrlBase64Safe(strItems)
  // Find all cases with digit and double quotation together and split it removing only the double quotation
  // Then we have array of strings and at the end of the string should be 0 or 1 for unchecked or checked respectively
  return atob(strItems).replace(/(\d)\|/g, `$1${delimiter}`).split(delimiter).map((strItem) => ({
    id: makeId(),
    text: strItem.substring(0, strItem.length - 1),
    checked: strItem.substring(strItem.length - 1) === '1'
  }))
}

export const getQueryVariable = (key) => {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const posSplit = vars[i].indexOf('=')
    if (vars[i].substr(0, posSplit) === key) {
      return vars[i].substr(posSplit + 1)
    }
  }
  return false
}

// export const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// ################################ //
// ########## Test cases ########## //
// ################################ //

window.testShareMethod = (items) => {
  const defaultTestCase = [
    { id: 'GmQHYM3b8i', text: 'Make to do list', checked: true },
    { id: 'HP3OJ6nOIG', text: 'Realize you\'ve already accomplished 2 things', checked: true },
    { id: 't6brMWNG2d', text: 'Check off first thing on to do list', checked: true },
    { id: 'DbxtHafhkH', text: 'Reward yourself with nap', checked: false }
  ]
  const itemsX = Array.isArray(items) ? items : defaultTestCase

  console.log('itemsBefore:', itemsX)
  const itemsStringified = stringifyItems(itemsX)
  console.log('itemsStringified:', itemsStringified)
  const itemsY = parseItems(itemsStringified)
  console.log('itemsAfter:', itemsY)

  const x = itemsX.reduce((acc, curr) => (acc += `|${curr.text}${curr.checked ? '1' : '0'}`), '').substr(1)
  const y = itemsY.reduce((acc, curr) => (acc += `|${curr.text}${curr.checked ? '1' : '0'}`), '').substr(1)
  console.log('X:', x)
  console.log('Y:', y)
  console.log('is items the same: ', x === y ? 'YES' : 'NO!')
}
