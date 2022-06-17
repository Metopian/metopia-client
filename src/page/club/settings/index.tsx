
import 'rc-slider/assets/index.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChainId } from '../../../config/store'
import { thirdpartyApi } from '../../../config/urls'
import { useSpaceData } from '../../../governance'
import { MainButton } from '../../../module/button'
import { Input, Label } from '../../../module/form'
import { BasicProfileForm, useData as useBasicFormData } from './form/BasicProfileForm'
import { ConsensusForm, useData as useConsensusForm } from './form/ConsensusForm'
import { useData as useVotingForm, VotingForm } from './form/VotingForm'
import { defaultForm, doCreateDao, doUpdateDao, formToSettings, settingsToForm, snapshotDataToForm } from './function'
import './index.css'

const ClubSettingPage = (props) => {
    /**
     * if slug -> update space settings
     */
    const { slug } = props
    const { data: basicFormData, update: updateBasicForm } = useBasicFormData()
    const { data: consensusForm, update: updateConsensusForm } = useConsensusForm()
    const { data: votingFormData, update: updateVotingForm } = useVotingForm()
    const [errors, setErrors] = useState({})
    const [creating, setCreating] = useState(false)
    const consensusFormRef = useRef<any>()
    const { data: defaultSpaceSettings, error } = useSpaceData(slug)
    const [network, setNetwork] = useState(null)
    const { chainId } = useChainId()
    useEffect(() => {
        // let { basicFormData, consensusForm, votingFormData } = defaultForm()
        if (defaultSpaceSettings?.code === 200) {
            let { basicFormData, consensusForm, votingFormData, network } = settingsToForm(defaultSpaceSettings.content.settings)
            updateBasicForm(basicFormData)
            updateConsensusForm(consensusForm)
            updateVotingForm(votingFormData)
            setNetwork(network)
            
        } else {
            let { basicFormData, consensusForm, votingFormData } = defaultForm()
            updateBasicForm(basicFormData)
            updateConsensusForm(consensusForm)
            updateVotingForm(votingFormData)
        }
    }, [defaultSpaceSettings])

    const createClub = () => {
        let errorKeys = validateData()
        if (errorKeys.length) {
            window.alert(errors[errorKeys[0]])
            return
        }
        formToSettings(network || chainId, basicFormData, consensusForm, votingFormData).then(settings => {
            if (!window.confirm("Do you want to continue?"))
                return
            setCreating(true)
            if (slug) {
                doUpdateDao(slug, settings, () => setCreating(false))
            } else {
                doCreateDao(settings, () => setCreating(false))
            }
        })
    }

    const validateData = useCallback(() => {
        let errtmp: any = {}
        if (!basicFormData?.name?.length) {
            errtmp.name = 'Name field is required'
        }
        if (!consensusForm.membership?.filter(m => m.tokenAddress)?.length) {
            errtmp.consensus = 'The membership cannot be empty'
        }
        setErrors(errtmp)
        return Object.keys(errtmp)
    }, [basicFormData, consensusForm])

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

            let { basicFormData, consensusForm, votingFormData } = snapshotDataToForm(r.data.spaces[0])
            updateBasicForm(basicFormData)
            updateConsensusForm(consensusForm)
            updateVotingForm(votingFormData)
        })
    }

    return <div className='CreateClubPage'>
        <div className="CreateClubPageHead">
            <div className="CreateClubPageTitle" style={{ margin: 0 }}>{slug ? 'Update settings' : 'Create new DAO'}</div>
            <div style={{ display: 'flex', gap: '24px', marginLeft: 'auto' }}>
                <MainButton onClick={createClub} disabled={creating}>Confirm</MainButton>
            </div>
        </div>

        <div className='CreateClubImportContainer' style={slug ? { display: 'none' } : {}}>
            <Label style={{ marginBottom: '12px' }}>Import from Snapshot space</Label>
            <div style={{ fontSize: '14px', color: '#BBBBBB', marginBottom: '20px' }}>Only strategies of <span style={{ fontStyle: 'italic' }}>erc721</span> on Ethereum will be automatically loaded.</div>
            <div style={{ marginBottom: '20px' }}>
                <Input placeholder="Paste your Snapshot sapce link" id="snapshotlinkinput" />
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

        <BasicProfileForm display={true} errors={errors} />
        <ConsensusForm display={true} errors={errors} ref={consensusFormRef} />
        <VotingForm display={true} />
    </div >
}

export default ClubSettingPage