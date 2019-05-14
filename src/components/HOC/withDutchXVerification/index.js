import React, { useEffect, useState } from 'react'
import localForage from 'localforage'

import Verification from '../../../index'

import { asyncSaveSettings } from '../../../helpers/localForage'

import { makeCancelable } from '../../../utils'

export function useLocalForageVerificationSettings(localForageKey) {
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
    
    const cancelableGetDisclaimerSettings = makeCancelable(localForage.getItem(localForageKey))

    useEffect(() => {
        const getLocalForageVerificationSettings = async () => {
            try {
                const { disclaimer_accepted } = await cancelableGetDisclaimerSettings.promise

                setDisclaimerAccepted(disclaimer_accepted)
            } catch (error) {
                if (error.isCanceled) 
                    return console.warn('Mount logic interrupted by unmount - cancelling pending promise(s) and cleaning up')
                else
                    return console.error('Error in withDutchXVerification async mount logic: ', err)
            }
        }

        getLocalForageVerificationSettings()

        return () => {
            cancelableGetDisclaimerSettings.cancel()
        }
    }, [])

    return disclaimerAccepted
}

const withDutchXVerification = Component =>
    (LF_VERIFICATION_KEY, LF_COOKIES_KEY, verificationProps) =>
        function DutchXVerificationHOC(props) {
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

export default withDutchXVerification
