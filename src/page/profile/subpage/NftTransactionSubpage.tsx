import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MainButton } from '../../../module/button';
import { useNfts, useNftTransactions } from '../../../third-party/moralis';
import { useChainId } from '../../../config/store';

const NftTransactionSubpage = (props) => {
    const { slug } = props
    const { chainId } = useChainId()
    const { data: nfts } = useNfts(slug, chainId)
    const { data: nftTransactions } = useNftTransactions(slug, chainId)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [blocknumber, setBlocknumber] = useState(9999999999.0)

    const test = (form) => {
        setBlocknumber(form.blocknumber)
    }
    const res = useMemo(() => {

        let tmp = nfts && nfts.result && nfts.result.map(n => {
            return { name: n.name, tokenId: n.token_id, contract: n.token_address }
        })

        let toPush = [], toRemove = []

        let filtered = nftTransactions && nftTransactions.result && nftTransactions.result.filter(n => {
            return parseFloat(n.block_number) > blocknumber
        }).sort((f1, f2) => {
            if (f1.block_number < f2.block_number) {
                return -1
            } else {
                return 1
            }
        }).forEach(f => {
            if (f.from_address === slug) {
                // Transfered out
                toPush.push({ tokenId: f.token_id, contract: f.token_address })
            } else if (f.to_address === slug) {
                // Transfered in
                toRemove.push({ tokenId: f.token_id, contract: f.token_address })
                toPush = toPush.filter(p => p.tokenId !== f.token_id && p.contract !== f.token_address)
            }
        })
        tmp = tmp.filter(t => {
            return !toRemove.find(r => r.tokenId === t.tokenId && r.contract === t.contract)
        })
        toPush.forEach(p => {
            if (!tmp.find(t => p.tokenId === t.tokenId && p.contract === t.contract))
                tmp.push(p)
        })

        return tmp.map((t, i) => <div key={i}>{t.name} : {t.tokenId}</div>)
    }, [nfts, nftTransactions, blocknumber])

    return <div className='NftTransactionSubpage' style={{ padding: '40px' }}>
        <input {...register('blocknumber', { required: true })} placeholder="blocknumber" type="number" className="RInput" />
        <MainButton onClick={handleSubmit(test)} style={{ marginLeft: '40px' }}>Confirm</MainButton>
        <div style={{ height: '40px' }}></div>
        {res}
    </div>
}

export default NftTransactionSubpage
