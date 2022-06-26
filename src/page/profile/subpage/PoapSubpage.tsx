import React, { useMemo, useState } from 'react';
import { BulletList } from 'react-content-loader';
import Modal from 'react-modal';
import { usePoapData } from '../../../third-party/rss3';
import ProfileTable from '../module/ProfileTable';
import './PoapSubpage.scss';
import { customFormat } from '../../../utils/TimeUtil'
import { WrappedLazyLoadImage } from '../../../module/image';

const PoapContentModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '1100px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden'
    }
}

const PoapContentModal = (props) => {
    const { isShow, hide, data } = props
    return <Modal
        size="xl"
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, PoapContentModalStyle, props.style || {})}>
        <div className="poap-content-modal">
            <div className="head">
                <div className="title">POAP</div>
                <img src="/imgs/close.svg" alt="close" onClick={hide} />
            </div>
            <div className='body'>
                <div className='container'>
                    <div className='avatar-wrapper'>
                        <div className="avatar">
                            <WrappedLazyLoadImage src={data.image_url} alt="" />
                        </div>
                    </div>
                </div>
                <div className='container right'>
                    <div className="group">
                        <div className='title'>Title</div>
                        <div>{data.name}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Description</div>
                        <div className='description-area'>{data.description}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Date</div>
                        <div>{data?.date_created ? customFormat(new Date(data.date_created), '#YYYY#-#MM#-#DD#') : ''}</div>
                    </div>
                    {
                        data.event_url ? <div className="group">
                            <div className='title'>Link</div>
                            <a href={data.event_url}>{data.event_url}</a>
                        </div > : null
                    }
                </div>
            </div>
        </div >
    </Modal >
}

const PoapSubpage = (props) => {
    const { slug } = props
    const { data: poapData } = usePoapData(slug)
    const [selectedPoapData, setSelectedPoapData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const poapTable = useMemo(() => {
        return poapData && <ProfileTable data={poapData.map(d => {
            return [d.detail.name, customFormat(new Date(d.detail.date_created), '#YYYY#-#MM#-#DD#')]
        })} heads={['Event', 'Date']} onSelect={(i) => {
            setSelectedPoapData(poapData[i].detail)
            setShowModal(true)
        }} />
    }, [poapData])
    return poapData ? <div className='poap-subpage' style={{}}>
        {poapData.length > 0 ? poapTable : <div className="no-content-container" style={{ marginTop: '20px' }}>You have not collected any POAPs.</div>}
        <PoapContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedPoapData} />
    </div> : <div style={{ marginTop: '20px' }} className="no-content-container" >
        <BulletList style={{ height: '200px' }} color="#ffffff" />
        {/* <ReactLoading height={21} width={40} color='#333' /> */}
    </div>
}

export default PoapSubpage