import React from 'react'

const Imprint = ({ noTitle, cssClass = 'disclaimer' }) =>
    <div className={cssClass}>
        <article>
            {!noTitle && <h1 >imprint</h1>}
            <p>
                <strong>d.ex oü</strong><br/><br/>
                ahtri 12, <br/>
                tallinn 10151<br/>
                estonia
            </p>
            <p>
                e-mail: <a href="mailTo: info@slow.trade" style={{ color: '#fff', cursor: 'pointer' }}>info@slow.trade</a>
            </p>
            <p>
                company registration no. 14553524
            </p>

        </article>
    </div>

export default Imprint

