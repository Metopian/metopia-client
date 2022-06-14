import React from "react";
import { MainButton } from "../../../module/button";
import { useDiscordData } from "../../../third-party/discord";
import './DiscordSubPage.css';

const DiscordSubPage = props => {
    const { slug, state, code } = props
    const { data, error } = useDiscordData(slug, code)

    return <div className="DiscordSubPage">
        {
            data?.data?.redirect_uri ? <MainButton onClick={e => {
                window.open(data?.data?.redirect_uri)
            }}>Connect to Discord</MainButton> : null
        }
        {
            data?.data?.discordId ? <div>
                <div className="profilecontainer">
                    <div className="title">Profile</div>
                    <div style={{ display: "flex", alignItems: 'center', gap: '20px' }}>
                        <div className="avatarwrapper"><img src={"https://cdn.discordapp.com/avatars/" + data.data.discordId + "/" + data.data.discordAvatar + ".webp"} alt="avatar" /></div>
                        <div>
                            <div className="name">{data.data.discordName}</div>
                            <div>#{data.data.discordDiscrim}</div>
                        </div>
                    </div>
                </div>
                {
                    data.data.accountGuilds.filter(g => g.roles).length ? <div className="guilddetailcontainer">
                        <div className="title">Guilds</div>
                        <table >
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Roles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.accountGuilds.filter(g => g.roles).map(g => <tr><td className="name">{g.name}</td><td>{g.roles.map(r => r)}</td></tr>)}
                            </tbody>
                        </table>
                    </div> : null
                }

            </div> : null
        }
        <div></div>
    </div>
}

export default DiscordSubPage