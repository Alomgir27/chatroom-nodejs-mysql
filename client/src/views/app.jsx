import React, { useState, useEffect, useRef } from "react";
import Header from "./header.jsx";
import Body from "./body.jsx";
import CreateChannel from "./createchannel.jsx";
import ChannelDetails from "./channeldetails.jsx";
import { useNavigate } from "react-router-dom";
import "../css/app.css";

import axios, { all } from "axios";
import { baseURL } from "../components/config/baseURL";


function App({ socket }) {
  const [modal, setModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState(null);
  const [allChannelsData, setAllChannelsData] = useState({});
  const [allChannelsMessages, setAllChannelsMessages] = useState({});
  const [message, setMessage] = useState("");
  const [reply_to, setReplyTo] = useState(null);
  const [index, setIndex] = useState(localStorage.getItem("index") ? JSON.parse(localStorage.getItem("index")) : null);
  const [user, setUser] = useState(null);
  const [oldId, setOldId] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);


  const navigate = useNavigate();
  const messagesEndRef  = useRef(null);

  useEffect(() => {
	if (!localStorage.getItem("token")) {
	  navigate("/");
	}
	else {
	  setUser(JSON.parse(localStorage.getItem("user")));
	}
  }, []);

  

	useEffect(() => {
		localStorage.setItem("index", JSON.stringify(index));
	}, [index]);
	

  useEffect(() => {
	(async () => {
	  await axios.get(`${baseURL}/api/allmessages`)
	  .then(res => {
		let messages = res.data.messages;
		messages.sort((a, b) => (a.date_created > b.date_created) ? 1 : -1);
		messages.forEach(message => {
		  setAllChannelsMessages((allChannelsMessages) => {
			if(allChannelsMessages[message.channel_id]) {
			  return {
				...allChannelsMessages,
				[message.channel_id]: [...allChannelsMessages[message.channel_id], message]
			  }
			}
			else {
			  return {
				...allChannelsMessages,
				[message.channel_id]: [message]
			  }
			}
		  })
		})
		console.log(res.data.messages);
	  })
	  .catch(err => {
		console.log(err)
	  })
	})()
	}, []);

  useEffect(() => {
	(async () => {
	  await axios.get(`${baseURL}/api/channelsusers`)
	  .then(res => {
		let users = res.data.users;
		users.forEach(user => {
		  setAllChannelsData((allChannelsData) => {
			if(allChannelsData[user.channel_id]) {
			  return {
				...allChannelsData,
				[user.channel_id]: [...allChannelsData[user.channel_id], user]
			  }
			}
			else {
			  return {
				...allChannelsData,
				[user.channel_id]: [user]
			  }
			}
		  })
		})
		console.log(res.data.users);
	  })
	  .catch(err => {
		console.log(err)
	  })
	})()
	}, []);




  useEffect(() => {
	if(index !== null && channels.length > 0) {
	 if(channels[index].joined){
		setChannel(channels[index]);
		joinChannel(channels[index]);
		setIsMember(true);
	 }
	 else {
		setIsMember(false);
	 }
	}
   }, [index]);

  useEffect(() => {
	if(user) {
		(async () => {
			await axios.get(`${baseURL}/api/channels`)
			.then(res => {
				setChannels(res.data.channels);
				console.log(res.data.channels);
				if(index !== null && res.data.channels.length <= index) {
					setIndex(null);
				}
			})
			.catch(err => {
				console.log(err)
			})
		})()
	}
	}, [user]);
	

	  useEffect(() => {
		socket.on("message", (msg) => {
			setAllChannelsMessages((allChannelsMessages) => {
				if(allChannelsMessages[msg.channel_id]) {
					return {
						...allChannelsMessages,
						[msg.channel_id]: [...allChannelsMessages[msg.channel_id], msg]
					}
				}
				else {
					return {
						...allChannelsMessages,
						[msg.channel_id]: [msg]
					}
				}	
			});
		});

		return () => {
			socket.off("message");
		}
		
	}, [socket]);

	useEffect(() => {
		socket.on("deleteMessage", (msg) => {
			console.log(msg);
			setAllChannelsMessages((allChannelsMessages) => {
				if(allChannelsMessages[msg.channel_id]) {
					return {
						...allChannelsMessages,
						[msg.channel_id]: allChannelsMessages[msg.channel_id].filter((m) => m.message_id !== msg.message_id)
					}
				}
				else {
					return {
						...allChannelsMessages,
						[msg.channel_id]: [msg]
					}
				}
			});
		});

		return () => {
			socket.off("deleteMessage");
		}

	}, [socket]);


	  useEffect(() => {
		socket.on("channelData", (users) => {
			console.log(users);
			if(users.length > 0) {
				setAllChannelsData((allChannelsData) => {
					if(allChannelsData[users[0].channel_id]) {
						return {
							...allChannelsData,
							[users[0].channel_id]: users
						}
					}
					else {
						return {
							...allChannelsData,
							[users[0].channel_id]: users
						}
					}
				});
			}
		});

		return () => {
			socket.off("channelData");
		}

	}, [socket]);

	useEffect(() => {
		socket.on("joined", (channel) => {
			let channelIndex = channels.findIndex((c) => c.channel_id === channel.channel_id);
			let newChannels = [...channels];
			newChannels[channelIndex] = channel;
			setChannels(newChannels);
		});

		return () => {
			socket.off("joined");
		}
	}, [socket, channels]);

	useEffect(() => {
		socket.on("leaved", (channel) => {
			let channelIndex = channels.findIndex((c) => c.channel_id === channel.channel_id);
			let newChannels = [...channels];
			newChannels[channelIndex] = channel;
			setChannels(newChannels);
		});

		return () => {
			socket.off("leaved");
		}
	}, [socket, channels]);

	 

	  useEffect(() => {
		if(messagesEndRef?.current) {
			messagesEndRef?.current?.scrollTo && messagesEndRef.current.scrollTo(0, messagesEndRef.current.scrollHeight);
			// messagesEndRef?.current?.scrollIntoView && messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

		}
	}, [allChannelsMessages, channel]);

	useEffect(() => {
		if(oldId !== null && oldId !== index) {
			let user = JSON.parse(localStorage.getItem("user"));
			let oldChannel = channels[oldId];
			let object = {
				...oldChannel,
				user_id: user.user_id,
				name: user.name
			}
			socket.emit('leave', object);
			console.log("left");
		}
		if(index !== null) {
			setOldId(index);
		}

		return () => {
			socket.off("leave");
		}
	}, [index]);


	useEffect(() => {
		let user = JSON.parse(localStorage.getItem("user"));
		if(user) {
			if(user?.is_admin) {
				setIsAlreadyMember(true);
			}
			else {
				setIsAlreadyMember(false);
			}
		}
		if(index !== null && channels.length > 0) {
		if(user) {
			let channel = channels[index];
			if(channel?.created_by === user?.user_id || user?.is_admin) {
				setIsAlreadyMember(true);
			}
			else {
				if(allChannelsData[channel?.channel_id]) {
					allChannelsData[channel?.channel_id].forEach((thisUser) => {
						if(thisUser.user_id === user.user_id) {
							setIsAlreadyMember(true);
						}
					})
				}
				else {
					setIsAlreadyMember(false);
				}
			}
		}
	   }
	}, [index, channels, user, allChannelsData]);
	
		
	
		


 const  joinChannel = (channel, type) => {
	let user = JSON.parse(localStorage.getItem("user"));
	if(type === "requested" && channel.created_by !== user.user_id) {
		axios.post(`${baseURL}/api/joinrequest`, {
			channel_id: channel.channel_id,
			user_id: user.user_id,
			user_name: user.name
		})
		.then(res => {
			console.log(res.data);
			alert(res.data.message);
		})
		.catch(err => {
			console.log(err);
			alert(err.response.data.message);
		})
		return;
	}
	let obj = {
		...channel,
		user_id: user.user_id,
		name: user.name
	}
	setIndex(channels.findIndex((c) => c.channel_id === channel.channel_id));
	socket.emit("join", obj);
	setIsMember(true);
}

const sendMessage = (e) => {
	e.preventDefault();
	if(message) {
		let user = JSON.parse(localStorage.getItem("user"));
		let obj = {
			channel_id: channels[index].channel_id,
			user_id: user.user_id,
			user_name: user.name,
			message: message,
			reply_to: reply_to?.message_id
		}
		socket.emit("message", obj);
		setMessage("");
		setReplyTo(null);

	}
}

const handleKeyDown = (e) => {
	if(e.key === "Enter") {
		sendMessage(e);
	}
}




const handleInputChange = (value) => {
	setMessage(value);
	console.log(value);
}

const onDelete = (channel_id) => {
	setChannels(channels.filter((c) => c.channel_id !== channel_id));
	//delete index from channel_id set
	setAllChannelsMessages((allChannelsMessages) => {
		let newAllChannelsMessages = {...allChannelsMessages};
		delete newAllChannelsMessages[channel_id];
		return newAllChannelsMessages;
	});
	if(channels?.[index]?.channel_id === channel_id) {
		setIndex(null);
	}
}





  function handleSettings() {
    setModal(true);
  }

  function handleClose() {
    setModal(false);
  }

  function handleDetails() {
	setDetailsModal(true);
  }

  function handleDetailsClose() {
	setDetailsModal(false);
}

  return (
    <div className="chat-simulation">
      <Header setIndex={setIndex} channels={channels} setChannels={setChannels} />
      <Body 
	     channels={channels} 
	     onSettings={handleSettings} 
		 user={user} 
		 index={index} 
		 setIndex={setIndex} 
		 channelData={allChannelsData[channels[index]?.channel_id]}
		 messages={allChannelsMessages[channels[index]?.channel_id]}
		 joinChannel={joinChannel}
		 handleKeyDown={handleKeyDown}
		 handleInputChange={handleInputChange}
		 inputValue={message}
		 setReplyTo={setReplyTo}
		 messagesEndRef={messagesEndRef}
		 channel={channel}
		 isMember={isMember}
		 reply_to={reply_to}
		 setMessage={setMessage}
		 sendMessage={sendMessage}
		 socket={socket}
		 allChannelsMessages={allChannelsMessages}
		 onDelete={onDelete}
		 handleDetails={handleDetails}
		 isAlreadyMember={isAlreadyMember}
		/>
      {modal && <CreateChannel onClosed={handleClose} setChannels={setChannels} />}
	  {detailsModal && <ChannelDetails 
		onClosed={handleDetailsClose} 
		user={user} 
		channelData={allChannelsData[channels[index]?.channel_id]}
		joinChannel={joinChannel}
		channel={channels[index]}
		/>}
    </div>
  );
}

export default App;
