export const windowLoaded = new Promise((accept, reject) => {
    if (typeof window === 'undefined') {
      return accept()
    }
  
    if (typeof window.addEventListener !== 'function') {
      return reject(new Error('expected to be able to register event listener'))
    }
  
    window.addEventListener('load', function loadHandler(event) {
      window.removeEventListener('load', loadHandler, false)
  
      // return setTimeout(() => accept(event), 2000)
      return accept(event)
    }, false)
})

export const web3CompatibleNetwork = async (id) => {
    await windowLoaded
    // blocks access via load
    if (typeof window === 'undefined' || !window.web3) return (console.error('No Provider detected. Returning UNKNOWN network.'), 'UNKNOWN')

    let web3 = window.web3
    let netID

    // irregular APIs - Opera, new MM, some other providers
    if (web3.currentProvider && !web3.version) {
        console.warn('Non-Metamask or Gnosis Safe Provider injected web3 API detected')

        window.web3 = web3 = new Web3(web3.currentProvider)
    }

    // 1.X.X API
    if (typeof web3.version === 'string') {
        netID = await new Promise((accept, reject) => {
            web3.eth.net.getId((err, res) => {
                if (err) {
                    reject('UNKNOWN')
                } else {
                    accept(res)
                }
            })
        })
    } else {
        // 0.XX.xx API
        // without windowLoaded web3 can be injected but network id not yet set
        netID = await new Promise((accept, reject) => {
            web3.version.getNetwork((err, res) => {
                if (err) {
                    reject('UNKNOWN')
                } else {
                    accept(res)
                }
            })
        })
    }

    return netID
}