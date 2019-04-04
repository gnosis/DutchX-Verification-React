import React, { useEffect, useState } from 'react'
import localForage from 'localforage'

import Verification from '../index'

import { asyncSaveSettings } from '../helpers/localForage'

export function useLocalForageVerificationSettings(localForageKey) {
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

    useEffect(() => {
        const getLocalForageVerificationSettings = async () => {
            const { disclaimer_accepted } = await localForage.getItem(localForageKey)

            setDisclaimerAccepted(disclaimer_accepted)
        }

        getLocalForageVerificationSettings()
    }, [])

    return disclaimerAccepted
}

const DutchXVerificationHOC = Component =>
    (LF_VERIFICATION_KEY, LF_COOKIES_KEY, verificationProps) =>
        function HOCLogic(props) {
            const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
            const preCheckDisclaimer = useLocalForageVerificationSettings(LF_VERIFICATION_KEY)

            return (
                (preCheckDisclaimer || disclaimerAccepted )
                    ? 
                <Component {...props} /> 
                    : 
                <Verification
                    fontFamily="monospace"
                    relativeFontSize={13}
                    
                    acceptDisclaimer={setDisclaimerAccepted}
                    saveLocalForageVerificationSettings={asyncSaveSettings}

                    localForageVerificationKey={LF_VERIFICATION_KEY}
                    localForageCookiesKey={LF_COOKIES_KEY} 
                    {...verificationProps}
                />
            )
        }

export default DutchXVerificationHOC
