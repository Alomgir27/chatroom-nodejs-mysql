import React from "react";
import Contact from "../components/contact.jsx";
import "../css/contacts.css";
import "../css/header.css";


export default class Contacts extends React.PureComponent {
	constructor (props) {
		super (props);
		this.old_contact = null;
        
	}

    
    __on_contact_pressed = (ref, id) => {
        // An old contact is it available ?
        if (this.old_contact != null) this.old_contact.classList.remove ("active-contact");
        // Puts a class to the selected user contact.
        ref.classList.add ("active-contact");
        // Updates the old selected user contact.
        this.old_contact = ref;
        // Sets active user contact position index.
        // if(this?.props?.channels[id].joined){    
            this.props.setIndex (id);
            // Moves the scrollbar at the full bottom.
        // }
    }

    componentDidUpdate = () => {
        if(this.props?.index !== null){
            let ref = document.getElementById(`guests-contacts`);
            ref.scrollTop = ref.scrollHeight;
            let chaild = ref.children[this.props?.index];
            if (this.old_contact != null) this?.old_contact?.classList?.remove ("active-contact");
            chaild?.classList?.add ("active-contact");
            this.old_contact = chaild;

        }
       
    }


   
	render = () => (
    <div className = "users-contacts">
        {/* Global title */}
        <div className = "contacts-header">
            {/* Label text */}
            <div className = "contacts-title"><label><strong>Channels</strong></label></div>

            <div className = "upload-btn" title = "Send something." onClick = {() => this.props.onSettings ()}>
                <div className = "add-icon">
                    <svg viewBox = "0 0 32 32" width = "24px" height = "24px" fill = "#343434">
                        <g><line className = "plus" x1 = "16" x2 = "16" y1 = '7' y2 = "25"/>
                        <line className = "plus" x1 = '7' x2 = "25" y1 = "16" y2 = "16"/></g>
                    </svg>
                </div>
            </div>
        </div>
        {/* User contacts container */}
        <div className = "guests-contacts" id = "guests-contacts">
            {this?.props?.channels.map ((item, index) => (
            <Contact 
                key = {index} 
                name = {item?.channel_name} 
                id = {index} 
                num_users = {item?.num_users} 
                active_users = {item?.active_users}
                date = {item?.date_created} 
                type = {item?.type}
                item = {item}
                user = {this?.props?.user}
                onPressed = {(ref, id) => this.__on_contact_pressed (ref, id)}
                joinChannel={this.props?.joinChannel}
                allChannelsMessages={this.props?.allChannelsMessages}
                onDelete={this.props?.onDelete}
            />
            ))}
                
        </div>
    </div>
    );
}