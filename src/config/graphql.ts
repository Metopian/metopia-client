export const loadSnapshotSettingsById = (id: string) => {
    return {
        "operationName": "Spaces",
        "variables": {
            "id_in": [
                id,
                null
            ]
        },
        "query": "query Spaces($id_in: [String]) {\
            spaces(where: {id_in: $id_in}) {\
                id\
                name\
                about\
                network\
                symbol\
                network\
                terms\
                skin\
                avatar\
                twitter\    website\
                github\
                private\
                domain\
                members\
                admins\
                categories\
                plugins\
                followersCount\
                voting {\
                    delay\
                    period\
                    type\
                    quorum\
                    hideAbstain\
                }\
                strategies {\
                    name\
                    network\
                    params\
                }\
                validation {\
                    name\
                    params\
                }\
                filters {\
                    minScore\
                    onlyMembers\
                }\
            }\
        }"}
}

export const loadSnapshotProposalsById = (id: string) => {
   return {
        "operationName": "Proposal",
        "variables": {
            "id": id
        },
        "query": "query Proposal($id: String!) {\
            proposal(id: $id) {\
            id\
            ipfs\
            title\
            body\
            choices\
            start\
            end\
            snapshot\
            state\
            author\
            created\
            plugins\
            network\
            type\
            strategies {\
                name\
                params\
            }\
            space {\
                id\
                name\
            }\
            scores_state\
            scores\
            scores_by_strategy\
            scores_total\
            votes\
            }\
        }"
    }
}
export const loadSnapshotProposalsByDao = (daoSlug: string) => {
    return {
        "operationName": "Proposals",
        "variables": {
            "first": 6,
            "skip": 0,
            "space": daoSlug,
            "state": "all",
            "author_in": []
        },
        "query": "query Proposals($first: Int!, $skip: Int!, $state: String!, $space: String, $space_in: [String], $author_in: [String]) {\
            proposals(\
                first: $first\
                skip: $skip\
                where: {space: $space, state: $state, space_in: $space_in, author_in: $author_in}\
            ) {\
                id\
                ipfs\
                title\
                body\
                start\
                end\
                state\
                author\
                created\
                choices\
                space {\
                    id\
                    name\
                    members\
                    avatar\
                    symbol\
                }\
                scores_state\
                scores_total\
                scores\
                votes\
            }\
        }"
    }
}

export const loadSnapshotHistory = (address: string) => {
    return {
        operationName: "Votes",
        query: 'query Votes {\
                votes (\
                    first: 1000\
                    where: {voter: "' + address + '"}\
                ){\
                    id\
                    voter\
                    created\
                    choice\
                    proposal {\
                        id\
                        title\
                        choices\
                    }\
                    space {\
                        id\
                        name\
                        avatar\
                    }\
                }\
            }',
        variables: null
    }
}

export const loadSnapshotVotesByProposal = (id: string) => {
    return {
        "operationName": "Votes",
        "variables": {
            "id": id,
            "orderBy": "vp",
            "orderDirection": "desc",
            "first": 10
        },
        "query": "query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {\
        votes(\
            first: $first\
            skip: $skip\
            where: {proposal: $id, vp_gt: 0, voter: $voter}\
            orderBy: $orderBy\
            orderDirection: $orderDirection\
        ) {\
            ipfs\
            voter\
            choice\
            vp\
            vp_by_strategy\
        }\
        }"
    }
}