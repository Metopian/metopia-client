export const domain = {
    "name": "snapshot",
    "version": "0.1.4"
}
export const vote2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'uint32' },
        { name: 'metadata', type: 'string' }
    ]
};


export interface Vote {
    from?: string;
    space: string;
    timestamp?: number;
    proposal: string;
    choice: number | number[] | string;
    metadata: string;
}