
import "../css/msgheader.css";
import React from "react";
import moment from "moment";


import { IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";

export default class ChatMessagesHeader extends React.PureComponent {
  
	render(){
       if(this.props?.channel === null) return null;
        return (
            <div className = "chat-messages-header">
                <div className = "active-user-contact">
                    <div className = "active-user-data">
                        <div className = "active-username"><label><strong>{`#${this.props?.channel?.channel_name}`} . </strong></label></div>
                        <div className="active-user-label"><label>{this.props?.channel?.num_users + " / " + this.props?.channel?.users_limit}</label></div>
                        <div className = "active-user-label"><label>{moment(this.props?.channel?.date_created).fromNow()} </label></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={this.props.handleDetails}>
                            <Info />
                        </IconButton>
                    </div>
                </div>    
            </div>
        );
    }
}
