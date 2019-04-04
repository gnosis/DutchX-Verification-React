import localForage from 'localforage'

/**
 * asyncSaveSettings - Saves settings to Local Forage via passed in key
 * @param { { disclaimer_accepted: boolean, networks_accepted: { [string]: number } } } payload 
 * @param { string } localForageKey - string name of local forage key
 */
export const asyncSaveSettings = async (payload, localForageKey) => {
    const prevState = (await localForage.getItem(localForageKey)) || { networks_accepted: {} }

    return localForage.setItem(localForageKey, {
        ...prevState,
        disclaimer_accepted: payload.disclaimer_accepted,
        networks_accepted: {
            ...prevState.networks_accepted,
            ...payload.networks_accepted,
        },
    })
}
