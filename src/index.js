import React, { useEffect, useState, useDebugValue } from 'react'
import localForage from 'localforage'

import DefaultTermsText from './components/DefaultTermsText'
import DefaultPrivacyPolicy from './components/DefaultPrivacyPolicy'
import DefaultCookies from './components/DefaultCookies'

import withDutchXVerification from './components/HOC/withDutchXVerification'
import Imprint from './components/DefaultImprint'
import Modal, { ModalToggler, ModalCloser } from './components/Modal'

import disclaimerSVG from './assets/disclaimer.svg'

import { web3CompatibleNetwork, makeCancelable, geoBlockedCitiesToString } from './utils'

// Import CSS
import './styles/global.scss'

const GEO_BLOCKED_COUNTRIES_LIST = geoBlockedCitiesToString()

function Verification(props) {
  const [cookiesAnalyticsAccepted, setCookiesAnalyticsAccepted] = useState(true)
  const [formInvalid, setFormInvalid]                           = useState(!props.accepted)
  const [loading, setLoading]                                   = useState(true)
  const [network, setNetwork]                                   = useState(undefined)
  const [showModal, setShowModal]                               = useState({ show: false, type: undefined, prevType: undefined })

  // form validity
  let form = null

  // ComponentDidMount
  useEffect(() => {
    const cancellableNetworksAndCookieData = makeCancelable(Promise.all([
      web3CompatibleNetwork(),
      localForage.getItem(props.localForageCookiesKey),
    ]))
    
    async function mountPrep() {
      try {
        const [network, cookieData] = await cancellableNetworksAndCookieData.promise
                
        setCookiesAnalyticsAccepted(cookieData && cookieData.analytics)
        setNetwork(network)
        setLoading(false)
      } catch (err) {
        if (err.isCanceled) 
            return console.warn('Mount logic interrupted by unmount - cancelling pending promise(s) and cleaning up')
        else
            return console.error('Error in Verification async mount logic: ', err)
      }
    }

    mountPrep()

    return () => {
      cancellableNetworksAndCookieData.cancel()
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()

    const { 
      acceptDisclaimer,
      saveLocalForageVerificationSettings,
      localForageVerificationKey,
      localForageCookiesKey,
    } = props

    const accepted = form.checkValidity()
    setFormInvalid(!accepted)

    // redirect to /
    // save localForage data - remember network + choices
    if (accepted) {
      acceptDisclaimer(true)
      saveLocalForageVerificationSettings(
        {
          disclaimer_accepted: true,
          networks_accepted: {
            [network]: true,
          },
        },
        localForageVerificationKey,
      )
    }
    return localForage.setItem(localForageCookiesKey, { necessary: true, analytics: !!(cookiesAnalyticsAccepted) })
  }

  const onChange = () => setFormInvalid(!form.checkValidity())
  
  const ModalMap = {
    COOKIES: (
      <Modal>
        <div className="fullModal">
          <ModalToggler 
            clickHandler={() => setShowModal({ show: !!(showModal.prevType), type: showModal.prevType })} 
            component={ModalCloser}
          />
          <DefaultCookies 
            LF_COOKIES_KEY={props.localForageCookiesKey} 
            // fontFamily='monospace' 
            showPrivacyModal={() => setShowModal({ show: true, type: 'PRIVACY', prevType: 'COOKIES' })}
            showTermsModal={() => setShowModal({ show: true, type: 'TERMS', prevType: 'COOKIES' })}
          />
        </div>
      </Modal>
    ),
    PRIVACY: (
      <Modal>
        <div className="fullModal">
          <ModalToggler 
            clickHandler={() => setShowModal({ show: !!(showModal.prevType), type: showModal.prevType })} 
            component={ModalCloser}
          />
          <DefaultPrivacyPolicy 
            showCookiesModal={() => setShowModal({ show: true, type: 'COOKIES', prevType: 'PRIVACY' })}
            showTermsModal={() => setShowModal({ show: true, type: 'TERMS', prevType: 'PRIVACY' })}
          />
        </div>
      </Modal>
    ),
    TERMS: (
      <Modal>
        <div className="fullModal">
          <ModalToggler 
            clickHandler={() => setShowModal({ show: !!(showModal.prevType), type: showModal.prevType })} 
            component={ModalCloser}
          />
          <div className="contentPage" tabIndex={1}>
            <article className="contentArticle">
              <DefaultTermsText
                // fontFamily='monospace'
                showCookiesModal={() => setShowModal({ show: true, type: 'COOKIES', prevType: 'TERMS' })}
                showPrivacyModal={() => setShowModal({ show: true, type: 'PRIVACY', prevType: 'TERMS' })}
              />
            </article>
          </div>
        </div>
      </Modal>
    )
  }

  function renderVerification() {
    const { accepted } = props

    let disclaimerConfirmClasses = 'buttonCTA'
    let disclaimerErrorStyle = {
      height: '20px',
      overflow: 'hidden',
      transition: 'all 0.4s ease-in-out',
    }

    if (formInvalid) {
      disclaimerConfirmClasses += ' buttonCTA-disabled'
    } else {
      disclaimerErrorStyle = {
        ...disclaimerErrorStyle,
        height: '0px',
      }
    }

    return (
      <div>
        <section 
          className="disclaimer" 
          style={{ 
            fontSize: props.relativeFontSize || 12, 
            fontFamily: props.fontFamily || 'monospace'
          }}
        >

          <span>
            <img src={disclaimerSVG} />
            <h1>Verification and Terms</h1>
          </span>

          <div>
            <h2>Please confirm before continuing:</h2>
            <form
              id="disclaimer"
              ref={c => form = c}
              onSubmit={onSubmit}
              onChange={onChange}
            >

              <div className="disclaimerBox md-checkbox">
                <input id="disclaimer1" type="checkbox" required defaultChecked={accepted} disabled={accepted} />
                <label htmlFor="disclaimer1">
                  I am NEITHER a citizen or resident of, NOR currently located in any of the following states or territories, NOR an entity formed under the laws of:
                  {' ' + (!!(props.customGeoBlockList) && props.customGeoBlockList || GEO_BLOCKED_COUNTRIES_LIST)}
                </label>
              </div>

              <div className="disclaimerBox md-checkbox">
                <input id="disclaimer2" type="checkbox" required defaultChecked={accepted} disabled={accepted} />
                <label htmlFor="disclaimer2">
                  I certify that I am NEITHER on any of the U.S. Treasury Department’s Office of Foreign Asset Control’s sanctions lists, the U.S. Commerce Department's Consolidated Screening List, the EU consolidated list of persons, groups or entities subject to EU financial sanctions, NOR do I act on behalf of a person sanctioned thereunder or a U.S.-, EU- or UN-sanctioned state.
                </label>
              </div>

              <div className="disclaimerBox md-checkbox">
                <input
                  id="disclaimer3"
                  type="checkbox"
                  required
                  defaultChecked={accepted}
                  disabled={accepted}
                />
                <label htmlFor="disclaimer3">
                  I have read, understood, and agree to the full Terms and Conditions:
                </label>
              </div>

              {network
                ?
              <div className="disclaimerTextbox">
                {props.render 
                  ? 
                props.render() 
                  : 
                <DefaultTermsText
                  showCookiesModal={() => setShowModal({ show: true, type: 'COOKIES' })}
                  showPrivacyModal={() => setShowModal({ show: true, type: 'PRIVACY' })}
                  {...props}
                />}
              </div>
                :
              null}

              <div className="disclaimerBox md-checkbox">
                <input id="disclaimer5" type="checkbox" required defaultChecked={accepted} disabled={accepted} />
                <label htmlFor="disclaimer5">
                  I have read and understood the <ModalToggler clickHandler={() => setShowModal({show: !showModal.show, type: 'PRIVACY', prevType: undefined})} render={() => <span>Privacy Policy</span>}/>
                </label>
              </div>

              {/* COOKIE DISCLAIMER */}
              <div className="disclaimerCookiePolicy">
                <div>
                  <p>
                    I agree to the storing of cookies on my device to enhance site navigation and analyze site usage. 
                    Please read the <ModalToggler 
                      clickHandler={() => setShowModal({ show: !showModal.show, type: 'COOKIES', prevType: undefined })} 
                      render={() => <span>Cookie Policy</span>}
                    /> for more information.
                  </p>
                  <div>
                      <div className="disclaimerBoxCookie md-checkbox">
                        <input id="disclaimer5" type="checkbox" required defaultChecked disabled/>
                        <label htmlFor="disclaimer5">Necessary</label>
                      </div>
                      <div className="disclaimerBoxCookie md-checkbox">
                        <input id="disclaimer6" type="checkbox" 
                          onChange={() => setCookiesAnalyticsAccepted(!cookiesAnalyticsAccepted)} 
                          defaultChecked={cookiesAnalyticsAccepted} 
                          disabled={accepted}
                        />
                        <label htmlFor="disclaimer6">Analytics</label>
                      </div>
                  </div>
                </div>
              </div>

              <p className="disclaimerError" style={disclaimerErrorStyle}>
                Please read and truly confirm all sections before you continue
              </p>
            </form>

            <span className="disclaimerFooterActions">
              <button
                id="disclaimer-submit"
                form="disclaimer"
                type="confirm"
                className={disclaimerConfirmClasses}
              >
                Continue
              </button>
            </span>

          </div>
        </section>
        <Imprint cssClass="modalDisclaimer" noTitle={true} />
      </div>
    )
  }

  const modal = showModal.show && ModalMap[showModal.type]

  return (
    <>
      {loading ? null : renderVerification()}
      {modal}
    </>
  )
}

export { Verification as default, withDutchXVerification }

