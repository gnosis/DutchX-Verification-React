# DutchX Verification React
Simple package for keeping all DutchX Protocol related verification required across multiple projects in one repo.

## Using
Install
`npm i @gnosis.pm/dutchx-verification`

Using - 2 options
1. Component approach:
```
```
2. HOC approach:
<br />
Type: curried function

```
DutchXVerificationHOC(ReactComponent<any>)(LOCALFORAGE_VERIFICATION_SETTINGS_KEYNAME, LOCALFORAGE_COOKIES_SETTINGS_KEYNAME, VerificationModalProps)
```

`ReactComponent`: any react component

`LOCALFORAGE_VERIFICATION_SETTINGS_KEYNAME`: string name wishing to save modal verification settings under in browser local database

`LOCALFORAGE_COOKIES_SETTINGS_KEYNAME`: string name wishing to save modal cookies settings under in browser local database

`VerificationModalProps`: object of additional props to pass into verification modal to overwrite default props (see below)

#### Example code:
```jsx
// inside top level App.jsx for example
import React from 'react'
import { DutchXVerificationHOC } from '@gnosis.pm/dutchx-verification-react'

import AppOnlineStatusBar from './components/display/AppOnlineStatus'
import Home from './components/display/Home'
import StateProvider from './components/StateProvider'

import { LOCALFORAGE_KEYS } from './globals'

const App = () => (
    <StateProvider>       
        <AppOnlineStatusBar />
        <Home />
    </StateProvider>
)

export default DutchXVerificationHOC(App)('MyProject_VerificationSettings', 'MyProject_CookieSettings')

```

## Issues
This is a new, WIP package so please report any issues!

## License
MIT
