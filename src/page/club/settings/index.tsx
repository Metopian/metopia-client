
import $ from 'jquery'
import 'rc-slider/assets/index.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChainId } from '../../../config/store'
import { localRouter, nftDataApi, thirdpartyApi } from '../../../config/urls'
import { useSpaceData } from '../../../governance'
import { MainButton } from '../../../module/button'
import { Input, Label } from '../../../module/form'
import { encodeQueryData } from '../../../utils/RestUtils'
import { BasicProfileForm, useData as useBasicFormData } from './form/BasicProfileForm'
import { ConsensusForm, useData as useConsensusForm } from './form/ConsensusForm'
import { ProposalForm, useData as useProposalForm } from './form/ProposalForm'
import { useData as useVotingForm, VotingForm } from './form/VotingForm'
import { defaultForm, doCreateDao, doUpdateDao, formToSettings, settingsToForm, snapshotDataToForm } from './function'
import './index.scss'

const ClubSettingPage = (props) => {
    /**
     * if slug -> update space settings
     */
    const { slug } = props
    const { data: basicFormData, update: updateBasicForm } = useBasicFormData()
    const { data: consensusForm, update: updateConsensusForm } = useConsensusForm()
    const { data: votingForm, update: updateVotingForm } = useVotingForm()
    const { data: proposalForm, update: updateProposalForm } = useProposalForm()
    const [errors, setErrors] = useState({})
    const [creating, setCreating] = useState(false)
    const consensusFormRef = useRef<any>()
    const { data: defaultSpaceSettings, error } = useSpaceData(slug)
    const [network, setNetwork] = useState(null)
    const { chainId } = useChainId()
    const container = useRef(null)
    const [expandImportDiv, setExpandImportDiv] = useState(false)

    useEffect(() => {
        $('.MainContainer').css({ 'overflow-y': 'hidden' })
        return () => {
            $('.MainContainer').css({ 'overflow-y': 'auto' })
        }
    }, [])

    useEffect(() => {
        if (updateBasicForm && updateConsensusForm && updateVotingForm) {
            if (defaultSpaceSettings?.code === 200) {
                let { basicFormData, consensusForm, votingForm, proposalForm, network } = settingsToForm(defaultSpaceSettings.content.settings) || defaultForm()
                updateBasicForm(basicFormData)
                updateConsensusForm(consensusForm)
                updateVotingForm(votingForm)
                updateProposalForm(proposalForm)
                setNetwork(network)
            } else {
                let { basicFormData, consensusForm, votingForm, proposalForm } = defaultForm()
                updateBasicForm(basicFormData)
                updateConsensusForm(consensusForm)
                updateVotingForm(votingForm)
                updateProposalForm(proposalForm)
            }
        }
    }, [defaultSpaceSettings, updateBasicForm, updateConsensusForm, updateVotingForm, updateProposalForm])

    const createClub = () => {
        let errors = validateData()
        if (Object.keys(errors).length) {
            window.alert(errors[Object.keys(errors)[0]])
            return
        }
        let settings = formToSettings(network || chainId, basicFormData, consensusForm, proposalForm, votingForm)
        console.log(settings)
        return
        // if (!window.confirm("Do you want to continue?"))
        //     return

        setCreating(true)
        settings.strategies.forEach(s => {
            fetch(encodeQueryData(nftDataApi.nft_transfer_cacheAll, { chain_id: network || chainId, address: s.params.address }))
        })

        if (slug) {
            doUpdateDao(slug, settings, () => setCreating(false))
        } else {
            doCreateDao(settings, () => setCreating(false))
        }
    }

    const validateData = useCallback(() => {
        let errtmp: any = {}
        if (!basicFormData?.name?.length) {
            errtmp.name = 'Name field is required'
        }
        if (!consensusForm.membership?.filter(m => m.tokenAddress)?.length) {
            errtmp.consensus = 'The membership cannot be empty'
        }
        if (proposalForm.validation.name === 'discord') {
            if (!proposalForm.validation.params?.guildId?.length || !proposalForm.validation.params?.roles?.length) {
                errtmp.proposal = 'You should select roles to check the authorities.'
            }
        }
        setErrors(errtmp)
        return errtmp
    }, [basicFormData, consensusForm, proposalForm])

    const syncSnapshotData = (id) => {
        fetch(thirdpartyApi.snapshot_api_graph, {
            method: 'POST',
            body: JSON.stringify({
                "operationName": "Spaces",
                "variables": {
                    "id_in": [
                        id,
                        null
                    ]
                },
                "query": "query Spaces($id_in: [String]) {\n  spaces(where: {id_in: $id_in}) {\n    id\n    name\n    about\n    network\n    symbol\n    network\n    terms\n    skin\n    avatar\n    twitter\n    website\n    github\n    private\n    domain\n    members\n    admins\n    categories\n    plugins\n    followersCount\n    voting {\n      delay\n      period\n      type\n      quorum\n      hideAbstain\n    }\n    strategies {\n      name\n      network\n      params\n    }\n    validation {\n      name\n      params\n    }\n    filters {\n      minScore\n      onlyMembers\n    }\n  }\n}"
            }), headers: {
                'content-type': "application/json"
            }
        }).then(r => r.json()).then(r => {
            if (!r.data?.spaces.length) {
                window.alert("The space does not exist.")
                return
            }

            let { basicFormData, consensusForm, votingForm } = snapshotDataToForm(r.data.spaces[0])
            updateBasicForm(basicFormData)
            updateConsensusForm(consensusForm)
            updateVotingForm(votingForm)
        })
    }

    return <div className='create-club-page'>
        <div className="head">
            <div className="title" style={{ margin: 0 }}>
                <img src="/imgs/arrow-left.svg" className="backarrow" alt="back" onClick={() => {
                    window.location.href = localRouter("club.prefix") + slug
                }} />{slug ? 'Update settings' : 'Create new DAO'}</div>
            <div style={{ display: 'flex', gap: '24px', marginLeft: 'auto' }}>
                <MainButton onClick={createClub} disabled={creating} loading={creating}>Confirm</MainButton>
            </div>
        </div>
        <div className='body' ref={container} onScroll={e => {
            $('#createClubScrollbar').css({
                "top": (container.current.scrollTop + 80 + ((container.current.clientHeight - 250) * container.current.scrollTop /
                    (container.current.scrollHeight - container.current.clientHeight))) + 'px'
            })
        }}>
            {
                slug ? null : <div className='create-club-form' >
                    <div className={'import-snapshot-container' + (expandImportDiv ? ' expanded' : '')}>
                        <div className='head' onClick={() => { setExpandImportDiv(!expandImportDiv) }}>
                            <img src="/imgs/lil-triangle.svg" className='flag' alt="" />
                            <Label>Import from Snapshot space</Label>
                        </div>
                        <div className="Tip" style={{ marginBottom: '20px' }}>Only strategies of <span style={{ fontStyle: 'italic' }}>erc721</span> on Ethereum will be automatically loaded.</div>
                        <div style={{ marginBottom: '20px' }}>
                            <Input placeholder="Paste your Snapshot space link" id="snapshotlinkinput" />
                        </div>
                        <div>
                            <MainButton onClick={(e) => {
                                let url = (document.getElementById("snapshotlinkinput") as HTMLInputElement).value
                                let tmp = url.split("/")
                                if (!tmp.length)
                                    return
                                syncSnapshotData(tmp[tmp.length - 1])
                            }}>Import</MainButton>
                        </div>

                    </div>
                </div>
            }
            <BasicProfileForm errors={errors} slug={slug} />
            <ConsensusForm errors={errors} ref={consensusFormRef} />
            <ProposalForm errors={errors} />
            <VotingForm errors={errors} />
            <div className="scrollbar" id="createClubScrollbar"></div>
        </div>
    </div >
}

export default ClubSettingPage