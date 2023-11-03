import React, { useState, useRef, useEffect } from "react";
import "../css/header.css";


import axios from "axios";
import { baseURL } from "../components/config/baseURL";


const Header = (props) => {
  const field = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);


  const onClearSearchField = () => {
    field.current.value = "";
  };

  const onSelect = (value) => {
    setShowSuggestions(false);
    field.current.value = value.channel_name;
    let findIndex = props.channels.findIndex((channel) => channel.channel_id === value.channel_id);
    props.setIndex(findIndex);
  };

  const onInputValueChanged = async (event) => {
    let query = event.target.value;
    if(query.length > 0 && query[0] === '#') {
        query = query.slice(1);
    }
    if (query.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      // perform search and update suggestions
      await axios.get(`${baseURL}/api/search/${query}`).then((res) => {
        setSuggestions(res.data.channels);
        setShowSuggestions(true);
        console.log(res.data.channels);
        });
    }
  };

  return (
    <div className="global-header">
      <div className="chatroom-img">
        <div className="chatroom-text">
          <label>
            <strong>ChatRoom</strong>
          </label>
        </div>
      </div>
      {/* Search container */}
      <div className="searcher" title="Search something here.">
        {/* Input representation */}
        <input
          type="text"
          placeholder="#Search for a channel"
          onChange={onInputValueChanged}
          ref={field}
        />
        {/* Menu dropdown suggestions */}
        <div
          className="menu-dropdown"
          style={{ display: showSuggestions ? "inline-block" : "none", backgroundColor: "white", border: "1px solid silver" }}
        >
          {/* Draw menu dropdown */}
            {suggestions?.map((item, idx) => (
                <div style={{ padding: "5px 10px" }} key={idx}>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => onSelect(item)}
                    >
                        {'#' + item.channel_name}
                    </div>
                    <p style={{ fontSize: "12px", color: "gray" }}>
                        {item.type === "public" ? "Public" : "Private"}
                    </p>
                </div>
            ))}
        </div>
        {/* Clear icon section */}
        <div className="clear-icon" title="Clear the given value." onClick={onClearSearchField}>
          {/* Vector representation */}
          <svg viewBox = "0 0 512 512" width = "18px" height = "18px" fill = "silver">
                <g><path d = {`M256,33C132.3,33,32,133.3,32,257c0,123.7,100.3,224,224,224c123.7,0,224-100.3,224-224C480,133.3,
                379.7,33,256,33z M364.3,332.5c1.5,1.5,2.3,3.5,2.3,5.6c0,2.1-0.8,4.2-2.3,5.6l-21.6,21.7c-1.6,1.6-3.6,2.3-5.6,
                2.3c-2,0-4.1-0.8-5.6-2.3L256,289.8 l-75.4,75.7c-1.5,1.6-3.6,2.3-5.6,2.3c-2,
                0-4.1-0.8-5.6-2.3l-21.6-21.7c-1.5-1.5-2.3-3.5-2.3-5.6c0-2.1,0.8-4.2,2.3-5.6l75.7-76 l-75.9-75c-3.1-3.1-3.1-8.2,
                0-11.3l21.6-21.7c1.5-1.5,3.5-2.3,5.6-2.3c2.1,0,4.1,0.8,5.6,2.3l75.7,74.7l75.7-74.7 c1.5-1.5,3.5-2.3,5.6-2.3c2.1,
                0,4.1,0.8,5.6,2.3l21.6,21.7c3.1,3.1,3.1,8.2,0,11.3l-75.9,75L364.3,332.5z`}/></g>
            </svg>
        </div>
        <div className="searcher-icon">
            <svg viewBox = "0 0 32 32" width = "22px" height = "22px" fill = "silver">
                <g><path d = {`M29.71,28.29l-6.5-6.5-.07,0a12,12,0,1,0-1.39,1.39s0,.05,0,.07l6.5,6.5a1,1,0,0,0,1.42,0A1,1,0,0,0,29.71,
                28.29ZM14,24A10,10,0,1,1,24,14,10,10,0,0,1,14,24Z`}/></g>
            </svg>
        </div>
      </div>
      {/* logout */}
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.reload();
        }}>
            <svg viewBox = "0 0 512 512" width = "22px" height = "22px" fill = "silver">
                <g><path d = {`M256,32C132.3,32,32,132.3,32,256s100.3,224,224,224s224-100.3,224-224S379.7,32,256,32z M256,480 c-119.1,0-216-96.9-216-216S136.9,40,256,40s216,96.9,216,216S375.1,480,256,480z`}/></g>
                <g><path d = {`M256,128c-17.6,0-32,14.4-32,32v192c0,17.6,14.4,32,32,32s32-14.4,32-32V160C288,142.4,273.6,128,256,128z`}/></g>
                <g><path d = {`M256,128c-17.6,0-32,14.4-32,32v192c0,17.6,14.4,32,32,32s32-14.4,32-32V160C288,142.4,273.6,128,256,128z`}/></g>
                <g><path d = {`M256,128c-17.6,0-32,14.4-32,32v192c0,17.6,14.4,32,32,32s32-14.4,32-32V160C288,142.4,273.6,128,256,128z`}/></g>
            </svg>
            <p style={{ fontSize: "14px", color: "silver", marginLeft: "5px" }}>Logout</p>
        </div>
      
    </div>
  );
};

export default Header;



                  


                  