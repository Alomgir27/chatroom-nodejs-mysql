import RightChat from "../components/rchat.jsx";
import LeftChat from "../components/lchat.jsx";
import "../css/msgcontext.css";
import React from "react";

export default class ChatContext extends React.PureComponent {
 

   
   
	render(){
       if(!this.props?.isMember){
            return <div className = "active-guest-messages" ref = {this?.props?.messagesEndRef}>
            <div className = "chat-datetime">
                <div className = "chat-msg-user-contact">
                    <div className = "chat-msg-user" style = {{marginTop: "15px", marginBottom: "15px"}}>
                        <div className = "chat-msg-user-text">
                            <label>You are not a member of this channel.</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
        }
       

       return (
        <div className = "active-guest-messages" ref = {this?.props?.messagesEndRef}>

            {this.props?.messages?.map((item, index) => 
            <div className = "chat-datetime" key = {index}>
                {item?.type === 'bubble' ? (
                <div className = "msg-date" align = "center" style = {{display:  "block", width: "100%", height: "100%",  marginTop: "10px", marginBottom: "10px"}}><label>{item.message}</label></div>
                ) : (
                <div className = "chat-msg-user-contact">
                    {(item?.user_id !== this.props?.user?.user_id ?
                        <LeftChat 
                        key = {item?.message_id} 
                        text = {item.message} 
                        item={item}
                        setReplyTo={this.props?.setReplyTo}
                        socket={this.props?.socket}
                        user={this.props?.user}
                        /> :
                        <RightChat 
                        key = {item?.message_id} 
                        text = {item.message} 
                        item={item}
                        setReplyTo={this.props?.setReplyTo}
                        socket={this.props?.socket}
                        user={this.props?.user}
                        />
                    )}
                </div>
                )}
            </div>
            )}
             {this.props?.reply_to !== null && (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto', borderRadius: 5, marginTop: 10, marginBottom: 10, padding: 10, backgroundColor: '#2f3136'}}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <p style={{color: 'white', fontSize: '12px', fontWeight: 'bold', textAlign: 'center'}}>
                            Replying to: {this.props?.reply_to?.user_name} - {this.props?.reply_to?.message}
                        </p>
                    </div>
                </div>
            )}
            {/* <div ref = {this?.props?.messagesEndRef}></div> */}
        </div>
         );
    }
}