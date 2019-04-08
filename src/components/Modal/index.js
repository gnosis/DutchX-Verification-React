import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

import { useNoScroll } from '../../helpers/hooks'

const modalRoot = document.getElementById('modal')

function Modal(props) {
    const element = document.createElement('div')

    useEffect(() => {
        modalRoot.appendChild(element)

        return () => modalRoot.removeChild(element)
    }, [props.children])

    // disable scroll on body
    useNoScroll()

    return ReactDOM.createPortal(
        // children components
        props.children,
        // dom element to attach modal to
        element,
    )
}

export function ModalToggler({
    clickHandler = () => alert('Please pass a proper clickHandler fn'),
    customStyle = {},
    component,
    render,
}) {
    if (typeof customStyle !== 'object') (console.warn((new Error('customStyle must be a valid React css object. E.g { backgroundColor: "red", fontSize: 20 }'))), customStyle = {})
    const defaultStyle = {
        color: '#0072cf',
        cursor: 'pointer',
        textDecoration: 'underline',
        ...customStyle,
    }

    return <span onClick={clickHandler} style={defaultStyle}>{component && component() || render()}</span>
}

export const ModalCloser = () => <span className="modalCloseButton">x</span>

export default Modal
