import React from "react";
import "../css/msgsettings.css";
import { baseURL } from "../components/config/baseURL";
import axios from "axios";


export default class CreateChannel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            limit: 0,
            user: [],
            isChannelExist: false,
            isPrivate: false,
        }
        this.handleName = this.handleName.bind(this);
        this.handleCreate = this.handleCreate.bind(this);

    }

    componentDidMount() {
        if(localStorage.getItem("token")) {
            this.setState({user: JSON.parse(localStorage.getItem("user"))});
        }
       
    }

    componentDidUpdate() {
        if(this.state.name !== "") {
            axios.get(`${baseURL}/api/channel/${this.state.name}`)
            .then(res => {
                if(res.data) {
                    this.setState({isChannelExist: true});
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({isChannelExist: false});
            })
        }
    }


    handleName = (e) => {
        this.setState({name: e.target.value});
    }

    handleCreate = async () => {
        if(this.state.isChannelExist) {
            alert("Channel already exist");
            return;
        }

        if(this.state.limit < 1) {
            alert("Limit must be greater than 0");
            return;
        }
        // Names must be without spaces, and shorter than 51 characters. underscores  allowed.
        const nameRegex = /^[a-zA-Z0-9_]{1,20}$/;
        if(!nameRegex.test(this.state.name.trim())){
            alert("Channel name must be without spaces, and shorter than 21 characters");
            return;
        }

        if(!this.state?.user?.user_id) {
            alert("User is not logged in");
            return;
        }


        let data = {
            channel_name: this.state.name,
            created_by: this.state?.user?.user_id,
            limit: this.state.limit,
            type: this.state.isPrivate ? "private" : "public"
        }
        await axios.post(`${baseURL}/api/createchannel`, data)
        .then(res => {
            console.log(res);
            this.props.setChannels((prev) => [res.data.channel, ...prev]);
            this.props.onClosed();
        })
        .catch(err => {
            console.log(err);
        })
    }


 
	render = () => (
    <div className = "msg-settings-bg">
        <div className = "msg-settings-modal">
            <div className = "msg-settings-header">
                <div className = "msg-set-title"><label>Create Channel or Group</label></div>
                <div className = "close-icon" title = "Close." onClick = {() => this.props.onClosed ()}>
                    <svg viewBox = "0 0 32 32" width = "24px" height = "24px" fill = "#343434">
                        <g><line className = "closer" x1 = '7' x2 = "25" y1 = '7' y2 = "25"/>
                        <line className = "closer" x1 = '7' x2 = "25" y1 = "25" y2 = '7'/></g>
                    </svg>
                </div>
            </div>
            <div className = "settings-content">
                <div className = "cnt-title-text"><label><strong>Create a channel or group. You can add people to it later.</strong></label></div><br/>
                <p style={{color: "red"}}>Channel name must be unique.</p>
                <div className = "cnt-details-text">
                    <label>Channels are great for team projects and direct messaging. Groups are useful for conversations with family and friends.</label>
                </div><br/>
                <div className = "cnt-title-text"><label><strong>Channel Name</strong></label></div><br/>
                <div className = "cnt-details-text">
                    <label>Names must be without spaces, and shorter than 21 characters.</label>
                    <input  
                        type = "text" 
                        placeholder = "Channel Name" 
                        onChange = {this.handleName}
                        style={{
                            width: "100%",
                            height: "30px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            padding: "5px",
                            outline: "none"
                        }}
                    />
                    {this.state.isChannelExist ? <p style={{color: "red"}}>Channel name already exist.</p> : null}
                </div><br/>

                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{width: "50%"}}><label><strong>Channel limit</strong></label></div>
                    <div style={{width: "50%"}}><label><strong>Channel Type</strong></label></div>
                </div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{width: "50%"}}>
                        <input
                            type = "number"
                            placeholder = "limit"
                            onChange = {(e) => this.setState({limit: e.target.value})}
                            style={{
                                width: "100%",
                                height: "30px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                padding: "5px",
                                outline: "none"
                            }}
                        />
                        <p style={{fontSize: "12px"}}>Channel limit must be greater than 0.</p>
                    </div>
                    <div style={{width: "50%"}}>
                        <select
                            style={{
                                width: "100%",
                                height: "30px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                padding: "5px",
                                outline: "none"
                            }}
                            onChange = {(e) => this.setState({isPrivate: e.target.value === "private" ? true : false})}
                        >
                            <option value = "public">Public</option>
                            <option value = "private">Private</option>
                        </select>
                    </div>
                </div>
                    
                
            </div><br/>
            <div className = "buttons-section">
                <button id = "cancel-button" title = "Cancel." onClick = {() => this.props.onClosed ()}>Cancel</button>
                <button id = "save-button" title = "Save." onClick = {this.handleCreate}>Create</button>
            </div>
        </div>
    </div>
    );
}
