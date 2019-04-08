import { useEffect } from 'react'

export const useNoScroll = () => {
    useEffect(() => {
        document.body.classList.add('noScroll')

        return () => document.body.classList.remove('noScroll')
    }, [])
}

