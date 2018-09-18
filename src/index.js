import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import App from './App'

import registerServiceWorker from './registerServiceWorker'

import packageJson from '../package.json'
window.appVersion = packageJson.version

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
