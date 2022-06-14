import React from 'react'
import './index.css'
const Metable = (props) => {
    const { heads, data, onSelect } = props
    return <table className={"Metable" + (onSelect ? ' selectable' : '')} >
        <thead>
            <tr>
                {
                    heads.map((h, i) => {
                        return <th key={"mehead" + i}>{h}</th>
                    })
                }
            </tr>
        </thead>
        <tbody>
            {
                data.map((d, i) => {
                    return <tr key={"merow" + i} onClick={() => { onSelect && onSelect(i) }}>
                        {d.map((d1, j) => {
                            return <td key={"mecell" + i + "-" + j} style={heads[j]?.toLowerCase() === 'date' ? { whiteSpace: 'nowrap' } : null}>{d1}</td>
                        })}
                    </tr>
                })
            }
        </tbody>
    </table>
}
export default Metable