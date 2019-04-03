import React from 'react'

import localForage from 'localforage'
window.localForage = localForage
import disclaimerSVG from './assets/disclaimer.svg'

import { web3CompatibleNetwork/* , geoBlockedCitiesToString */ } from './utils'

import Imprint from './components/DefaultImprint'

import DefaultTermsText from './components/DefaultTermsText'

// Default Privacy Policy
// import PrivacyPolicy from './assets/pdf/PrivacyPolicy.pdf'

// Import CSS
import './styles/global.scss'

// const GEO_BLOCKED_COUNTRIES_LIST = geoBlockedCitiesToString()

class Verification extends React.Component {
  state = {
    formInvalid: !this.props.accepted,
    cookies_analytics_accepted: true,
    loading: true,
    network: undefined,
  }

  form = null

  async componentDidMount() {
    try {
      const network = await web3CompatibleNetwork()
      const [cookieData] = await Promise.all([
        localForage.getItem(this.props.localForageCookiesKey)
      ])
      
      return this.setState({
        cookies_analytics_accepted: cookieData ? cookieData.analytics : this.state.cookies_analytics_accepted,
        loading: false,
        network,
      })
    } catch (err) {
      console.error(err)
      throw new Error(err.message)
    }
  }

  onSubmit = (e) => {
    e.preventDefault()
    const accepted = this.form.checkValidity()
    this.setState({
      formInvalid: !accepted,
      ...this.state,
    })
    // redirect to /
    if (accepted) {
      this.props.acceptDisclaimer(true)
      this.props.saveLocalForageVerificationSettings({
        disclaimer_accepted: true,
        networks_accepted: {
          [this.state.network]: true,
        },
      })
    }
    return localForage.setItem(this.props.localForageCookiesKey, { necessary: true, analytics: !!(this.state.cookies_analytics_accepted) })
  }

  onChange = () =>
    this.setState({
      formInvalid: !this.form.checkValidity(),
    })

  renderVerification() {
    const {
      cookies_analytics_accepted,
      formInvalid,
      network,
    } = this.state
    const { accepted } = this.props

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
            fontSize: this.props.relativeFontSize || 12, 
            fontFamily: this.props.fontFamily || 'monospace'
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
              ref={c => this.form = c}
              onSubmit={this.onSubmit}
              onChange={this.onChange}
            >

              <div className="disclaimerBox md-checkbox">
                <input id="disclaimer1" type="checkbox" required defaultChecked={accepted} disabled={accepted} />
                <label htmlFor="disclaimer1">
                  I am NEITHER a citizen or resident of, NOR currently located in any of the following states or territories, NOR an entity formed under the laws of:
                  {/* ' ' + GEO_BLOCKED_COUNTRIES_LIST */}
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
                {this.props.render 
                  ? 
                this.props.render() 
                  : 
                <DefaultTermsText 
                  {...this.props}
                />}
              </div>
                :
              null}

              <div className="disclaimerBox md-checkbox">
                <input id="disclaimer5" type="checkbox" required defaultChecked={accepted} disabled={accepted} />
                <label htmlFor="disclaimer5">
                  I have read and understood the <a href={this.props.privacyPolicy || 'https://slow.trade/#/PrivacyPolicy.pdf'} target="_blank">Privacy Policy</a>
                </label>
              </div>

              {/* COOKIE DISCLAIMER */}
              <div className="disclaimerCookiePolicy">
                <div>
                  <p>I agree to the storing of cookies on my device to enhance site navigation and analyze site usage. Please read the {/* <Link to="/cookies">Cookie Policy</Link> */} for more information.</p>
                  <div>
                      <div className="disclaimerBoxCookie md-checkbox">
                        <input id="disclaimer5" type="checkbox" required defaultChecked disabled/>
                        <label htmlFor="disclaimer5">Necessary</label>
                      </div>
                      <div className="disclaimerBoxCookie md-checkbox">
                        <input id="disclaimer6" type="checkbox" onChange={() => this.setState({ cookies_analytics_accepted: !this.state.cookies_analytics_accepted })} defaultChecked={cookies_analytics_accepted} disabled={accepted}/>
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

  render() {
    const { loading } = this.state

    return loading ? null : this.renderVerification()
  }
}

export default Verification

