import React, { useState, useEffect } from "react";
import moment from "moment";

import { ReplyAll } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { Delete } from "@mui/icons-material";

import axios from "axios";
import { baseURL } from "./config/baseURL";


export default function RightChat (props) {

    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        console.log(props?.item?.reply_to);
       if(props?.item?.reply_to === null) return;
        (async () => {
            await axios.get(`${baseURL}/api/message/${props?.item?.reply_to}`)
            .then(res => {
                setReplyMessage(res.data.message)
                console.log(res.data.message);
            })
            .catch(err => {
                console.log(err)
            })
        })()
    }, [props?.item?.reply_to]);

    const onDeleteMessage = async (item) => {
        props.socket.emit('deleteMessage', item);
    }

    return (
        <div style={{ 
            backgroundColor: '#F0F0F0',
            borderRadius: '10px',
            padding: '10px',
            margin: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '5px',
            marginBottom: '5px',

        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginBottom: '5px',
          }}>
            <span style={{
                fontSize: '10px',
                color: '#999',
                marginRight: '5px',
            }}>{'@' + props?.item?.user_name}</span>
            <span style={{
                fontSize: '10px',
                color: '#999',
            }}>{moment(props?.item?.date_created).format('DD/MM/YYYY HH:mm')}</span>
          </div>
          {replyMessage && (
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '10px',
                margin: '5px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: '5px',
                marginBottom: '5px',
                width: '100%',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    width: '100%',
                    marginBottom: '5px',
                }}>
                    <span style={{
                        fontSize: '10px',
                        color: '#999',
                        marginRight: '5px',
                    }}>{'@' + replyMessage?.user_name}</span>
                    <span style={{
                        fontSize: '10px',
                        color: '#999',
                    }}>{moment(replyMessage?.date_created).format('DD/MM/YYYY HH:mm')}</span>
                </div>
                <div style={{
                    wordBreak: 'break-word',
                    width: '100%',
                    textAlign: 'left',
                    color: '#000',
                    padding: '5px',
                    fontSize: '15px',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                }}>
                    {replyMessage?.message}
                </div>
            </div>
            )}
          <div style={{ 
            wordBreak: 'break-word',
            width: '100%',
            textAlign: 'right',
            color: '#000',
            padding: '5px',
            fontSize: '15px',
            fontWeight: '500',
            letterSpacing: '0.5px',            
          }}>
            {props.text}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
          }}>
            <IconButton size="small" style={{ padding: '5px' }} onClick={() => props?.setReplyTo(props.item)}>
                <ReplyAll style={{ fontSize: '20px' }} />
            </IconButton>
            {props?.item?.user_id === props?.user?.user_id ? <IconButton size="small" style={{ padding: '5px' }} onClick={() => onDeleteMessage(props.item)}>
                <Delete style={{ fontSize: '20px', color: '#999' }} />
            </IconButton>
            : props?.user?.is_admin ? <IconButton size="small" style={{ padding: '5px' }} onClick={() => onDeleteMessage(props.item)}>
                <Delete style={{ fontSize: '20px', color: '#999' }} />
            </IconButton>
            : null}
         </div>

          
        </div>
    );
}



