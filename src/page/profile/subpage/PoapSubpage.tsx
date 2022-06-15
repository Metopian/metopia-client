import React, { useState, useMemo } from 'react'
import { usePoapData } from '../../../third-party/rss3'
import Metable from '../module/MeTable'
import Modal from 'react-modal';
import './PoapSubpage.css'
// import ReactLoading from 'react-loading'
import { BulletList } from 'react-content-loader'

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
        width: '440px',
        //  height: '542px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden',
    }
}

const formatDate = function (date, fmt) { //author: meizz 
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

const PoapContentModal = (props) => {
    const { isShow, hide, data } = props

    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, PoapContentModalStyle, props.style || {})}>
        <div className="PoapContentModalContainer">
            <div className="PoapContentModalGroup">
                <div  ><img src={data.image_url} alt="" /></div>
            </div>
            <div className="PoapContentModalGroup">
                <div className='PoapContentTitle'>Title</div>
                <div>{data.name}</div>
            </div>
            <div className="PoapContentModalGroup">
                <div className='PoapContentTitle'>Description</div>
                <div className='PoapDescriptionArea'>{data.description}</div>
            </div>
            <div className="PoapContentModalGroup">
                <div className='PoapContentTitle'>Date</div>
                <div>{formatDate(new Date(data.date_created), 'yyyy-MM-dd')}</div>
            </div>
            {
                data.event_url ? <div className="PoapContentModalGroup">
                    <div className='PoapContentTitle'>Link</div>
                    <a href={data.event_url}>{data.event_url}</a>
                </div > : null
            }
        </div >
    </Modal >
}

const PoapSubpage = (props) => {
    const { slug } = props
    const { data: poapData, error } = usePoapData(slug)
    const [selectedPoapData, setSelectedPoapData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const poapTable = useMemo(() => {
        return poapData && <Metable data={poapData.map(d => {
            return [d.detail.name, formatDate(new Date(d.detail.date_created), 'yyyy-MM-dd')]
        })} heads={['Event', 'Date']} onSelect={(i) => {
            setSelectedPoapData(poapData[i].detail)
            setShowModal(true)
        }} />
    }, [poapData])
    return poapData ? <div className='PoapSubpage' style={{ padding: '10px 0 40px 0' }}>
        {poapData.length > 0 ? poapTable : <div style={{ fontSize: '18px', marginTop: '20px' }}>You have not collected any POAPs.</div>}
        <PoapContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedPoapData} />
    </div> : <div style={{ marginTop: '20px' }}>
        <BulletList style={{ height: '200px' }} />
        {/* <ReactLoading height={21} width={40} color='#333' /> */}
    </div>
}

export default PoapSubpage