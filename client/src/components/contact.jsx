import React, { useRef } from "react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import "../css/contact.css";
import moment from "moment";

import { Delete} from "@mui/icons-material";

import axios from "axios";

import { baseURL } from "./config/baseURL";



export default function Contact(props) {
  const contactRef = useRef(null);

  const [isShow, setIsShow] = React.useState(false);

  React.useEffect(() => {
    if (props?.item?.created_by === props?.user?.user_id || props?.user?.is_admin) {
        setIsShow(true);
    }
    else {
        setIsShow(false);
    }
    }, [props?.item?.created_by, props?.user?.user_id, props?.user?.is_admin]);

 

  const handleContactPress = () => {
    if (contactRef.current) {
      contactRef.current.classList.add("active-contact");
      props.onPressed(contactRef.current, props.id);
    }
  };


    const handleDelete = () => {
        axios.delete(`${baseURL}/api/channel/${props?.item?.channel_id}`)
            .then(res => {
                console.log(res.data);
                props?.onDelete(props?.item?.channel_id);
            })
            .catch(err => {
                console.log(err);
            })
        
    }

    const lastMessage = () => {
        const length = props?.allChannelsMessages[props?.item?.channel_id]?.length;
        if (length > 0) {
            const lastMessage = props?.allChannelsMessages[props?.item?.channel_id][length - 1];
            if (lastMessage?.message) {
                return lastMessage?.message.length > 20 ? lastMessage?.message.substring(0, 20) + "..." : lastMessage?.message;
            }
            return "No messages";
        }
        return "No messages";
    }

  

  return (
    <div className="guest-contact" ref={contactRef} onClick={handleContactPress}>
      <div className="guest-data">
        <div className="header-data">
            <div className="guest-name">
            <label>
                <strong>{"#" + props.name}</strong>
            </label>
            <p className="date">
                {moment(props.date).fromNow()} .{" "} {props?.type === "public" ? "Public" : "Private"}
            </p>
            </div>
            {isShow && (
                <div className="setting">
                    <div className="setting-btn" onClick={(e) => {
                            e.stopPropagation();
                            // alert("Settings");
                        }}>
                            <PopupState variant="popover" popupId="demo-popup-popover">
                                {(popupState) => (
                                <div>
                                    <Button  {...bindTrigger(popupState)}>
                                        <svg viewBox="0 0 32 32" width="24px" height="24px" fill="#343434">
                                            <g>
                                                <circle className="plus" cx="16" cy="16" r="2"/>
                                                <circle className="plus" cx="16" cy="8" r="2"/>
                                                <circle className="plus" cx="16" cy="24" r="2"/>
                                            </g>
                                        </svg>
                                    </Button>
                                    <Popover
                                        {...bindPopover(popupState)}
                                        anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                        marginTop: 10,
                                        }}
                                    >
                                        <Typography sx={{ p: 2 , mt: 2}}>
                                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10, cursor: "pointer"}} onClick={() => {
                                                        popupState.close();
                                                        handleDelete();
                                                    }}>
                                                        <Delete style={{color: "red"}}/>
                                                        <p style={{color: "#343434", marginLeft: 5}}>delete</p>
                                                    </div>
                                            </div>
                                        </Typography>
                                    </Popover>
                                    </div>
                                )}
                            </PopupState>
                    
                    </div>
                </div>
            )}
        </div>
        
        <div className="guest-num-users">
            <label>
                <strong>{props.num_users + " users"}</strong>
            </label>
        </div>
        
        <div className="bottom-data">
          <div className="chat-label">
            <label>{props.label}</label>
          </div>
          
        </div>
        <div className="bottom-data">
            <div className="chat-label">
                <label>{lastMessage()}</label>
            </div>
        </div>
      </div>
    </div>
  );
}
