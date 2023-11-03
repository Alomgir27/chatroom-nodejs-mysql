import React, { useState, useEffect } from "react";
import "../css/msgsettings.css";
import { baseURL } from "../components/config/baseURL";
import axios from "axios";


export default function ChannelDetails(props){
   
    const [users, setUsers] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [tab, setTab] = useState(0);


    useEffect(() => {
        (async () => {
            props?.channelData?.forEach(async (user ) => {
                await axios.get(`${baseURL}/api/user/${user.user_id}`)
                .then(res => {
                    console.log(res.data.user);
                    if(users.find(user => user?.user_id === res?.data?.user?.user_id)) return;
                    setUsers([...users, res.data.user])
                })
                .catch(err => {
                    console.log(err);
                })
            })
        })()
    }, [props?.channelData])

    useEffect(() => {
        (async () => {
            await axios.get(`${baseURL}/api/joinrequests/${props?.channel?.channel_id}`)
            .then(res => {
                setJoinRequests(res.data.join_requests);
            })
            .catch(err => {
                console.log(err);
            })
        })()
    }, [props?.channel?.channel_id])


    const handleAccept = async (item) => {
        setJoinRequests(joinRequests.filter(request => request?.request_id !== item?.request_id));
        console.log(item);
        setUsers([...users, {...item, name: item?.user_name}]);
       
        axios.post(`${baseURL}/api/joinrequests/accept`, {
            request_id: item?.request_id,
            channel_id: props?.channel?.channel_id,
            user_id: item?.user_id
        })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
    }




return (
    <div className = "msg-settings-bg">
        <div className = "msg-settings-modal">
            <div className = "msg-settings-header">
                <div className = "msg-set-title"><label>Channel Details</label></div>
                <div className = "close-icon" title = "Close." onClick = {() => props.onClosed ()}>
                    <svg viewBox = "0 0 32 32" width = "24px" height = "24px" fill = "#343434">
                        <g><line className = "closer" x1 = '7' x2 = "25" y1 = '7' y2 = "25"/>
                        <line className = "closer" x1 = '7' x2 = "25" y1 = "25" y2 = '7'/></g>
                    </svg>
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "column",  width: "100%", height: "100%", overflowY: "auto", padding: "10px", borderRadius: "10px"}}>
                <button style={{width: "100%", height: "40px", backgroundColor: "#F0F0F0", borderRadius: "10px", border: "none", outline: "none", cursor: "pointer", marginBottom: "10px"}} onClick={() => setTab(0)}>
                    <label style={{fontSize: "14px", color: "black"}}>Members</label>
                </button>
                {props?.channel?.type === 'private' && <button style={{width: "100%", height: "40px", backgroundColor: "#F0F0F0", borderRadius: "10px", border: "none", outline: "none", cursor: "pointer", marginBottom: "10px"}} onClick={() => setTab(1)}>
                    <label style={{fontSize: "14px", color: "black"}}>Join Requests</label>
                </button>}

                {tab === 0 && <div style={{display: "flex", flexDirection: "column", width: "100%", height: "400px", overflowY: "auto", padding: "10px", borderRadius: "10px", overflowX: "hidden"}}>
                    {users.map(user => (
                        <div key={user?.user_id} style={{display: "flex", flexDirection: "row", width: "100%", height: "55px", backgroundColor: "#F0F0F0", borderRadius: "10px", padding: "10px", margin: "5px", marginTop: "5px", marginBottom: "5px"}}>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "40px", height: "40px", backgroundColor: "#343434", borderRadius: "50%", marginRight: "10px"}}>
                                <label style={{fontSize: "14px", color: "white"}}>{user?.name?.charAt(0).toUpperCase()}</label>
                            </div>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", width: "100%", height: "100%"}}>
                                <label style={{fontSize: "14px", color: "black"}}>{user?.name} {user?.user_id === props?.channel?.created_by && <label style={{fontSize: "14px", color: "black"}}>(Owner)</label>}</label>
                            </div>
                        </div>
                    ))}
                </div>}
                {tab === 1 && <div style={{display: "flex", flexDirection: "column", width: "100%", height: "400px", overflowY: "auto", padding: "10px", borderRadius: "10px", overflowX: "hidden"}}>
                    {joinRequests?.map(request => (
                        <div key={request?.user_id}  style={{display: "flex", flexDirection: "row", width: "100%", height: "55px", backgroundColor: "#F0F0F0", borderRadius: "10px", padding: "10px", margin: "5px", marginTop: "5px", marginBottom: "5px"}}>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "40px", height: "40px", backgroundColor: "#343434", borderRadius: "50%", marginRight: "10px"}}>
                                <label style={{fontSize: "14px", color: "white"}}>{request?.user_name?.charAt(0).toUpperCase()}</label>
                            </div>
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", width: "100%", height: "100%"}}>
                                <label style={{fontSize: "14px", color: "black"}}>{request?.user_name} wants to join this channel.</label>
                            </div>
                            {props?.channel?.created_by === props?.user?.user_id && <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",  marginLeft: "10px", cursor: "pointer"}} onClick={() => handleAccept(request)}>
                                <label style={{fontSize: "14px", color: "#343434", fontWeight: "bold", cursor: "pointer"}}>Accept</label>
                            </div>}

                        </div>
                    ))}
                </div>}
               

               
            </div>  
        </div>
    </div>
   )
}