/* eslint-disable no-dupe-class-members */

import ChatMessagesHeader from "./msgheader.jsx";
import ChatMessageEditor from "./msgeditor.jsx";
import Contacts from "./contacts.jsx";
import ChatContext from "./chat.jsx";
import React from "react";
import "../css/body.css";



export default class Body extends React.PureComponent {

    constructor(props){
        super(props);
        this.state = {
            chats: [],
            active_contact_index: null,
            isAlreadyMember: false
        };

        this.__set_active_contact_index = this.__set_active_contact_index.bind(this);

    }


    __set_active_contact_index = new_index => this.props.setIndex (new_index);


	
	render = () => (
    <div className = "chat-workspace">
        <br/><div className = "chat-container">
             <Contacts 
                onSettings={() => this.props.onSettings ()} 
                channels={this.props.channels} 
                contacts={this.state.chats} 
                setIndex={this.__set_active_contact_index}
                user={this?.props?.user}
                joinChannel={this.props?.joinChannel}
                index={this.props.index}
                allChannelsMessages={this.props.allChannelsMessages}
                onDelete={this.props.onDelete}
             />
            {this.props?.isMember ? (
                <div className = "messages-workspace">
                    <ChatMessagesHeader 
                    channel={this.props?.index !== null ? this.props.channels[this.props?.index] : null}
                    channelData={this.props.channelData}
                    handleDetails={this.props?.handleDetails}
                    />
                    <ChatContext 
                    messagesEndRef = {this.props?.messagesEndRef}
                    channelData={this.props.channelData}
                    setMessages={this.props.setMessages}
                    messages={this.props.messages}
                    setReplyTo={this.props.setReplyTo}
                    user={this.props.user}
                    isMember={this.props.isMember}
                    index={this.props.index}
                    reply_to={this.props.reply_to}
                    socket={this.props.socket}
                    />
                    <ChatMessageEditor 
                    sendMessage = {this.props?.sendMessage}
                    index = {this.props?.index}
                    leaveChannel={this.props?.leaveChannel}
                    handleKeyDown={this.props?.handleKeyDown}
                    handleInputChange={this.props?.handleInputChange}
                    inputValue={this.props?.inputValue}
                    setReplyTo={this.props?.setReplyTo}
                    setMessage={this.props?.setMessage}
                    channelData={this.props.channelData}
                    />
                </div>
            ) : (
            <div className="messages-workspace">
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: "black"}}>Join a channel to start chatting</p>
                            <p style={{fontSize: '1rem', color: "black", marginTop: '10px'}}>Click on the join button to join a channel</p>
                            {this.props?.index !== null && this.props?.channels[this.props.index]?.type === 'private' && <p style={{fontSize: '1rem', color: "black", marginTop: '10px'}}>This channel is private, you need an invite to join</p>}
                            {this.props?.index !== null && this.props?.channels[this.props.index]?.type === 'public' && <p style={{fontSize: '1rem', color: "black", marginTop: '10px'}}>This channel is public, anyone can join</p>}
                            {this.props?.index !== null &&  this.props?.channels[this.props.index]?.type !== 'private' &&  <button onClick={() => this.props.joinChannel(this.props.channels[this.props.index])} style={{padding: '0.5rem 1rem', backgroundColor: 'teal', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Join</button>}
                            {this.props?.index !== null &&  this.props?.channels[this.props.index]?.type === 'private' &&  this.props.isAlreadyMember &&  <button onClick={() => this.props.joinChannel(this.props.channels[this.props.index])} style={{padding: '0.5rem 1rem', backgroundColor: 'teal', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Join</button>}
                            {this.props?.index !== null &&  this.props?.channels[this.props.index]?.type === 'private' && !this.props.isAlreadyMember &&  <button onClick={() => this.props.joinChannel(this.props.channels[this.props.index], 'requested')} style={{padding: '0.5rem 1rem', backgroundColor: 'teal', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Request to join</button>}
                        </div>
                    </div>
            </div>
            )}
        </div>
    </div>
    );
}

