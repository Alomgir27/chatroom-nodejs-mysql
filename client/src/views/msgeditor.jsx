import "../css/msgeditor.css";
import React from "react";



import axios from "axios";
import { baseURL } from "../components/config/baseURL";

export default class ChatMessageEditor extends React.PureComponent {
 
	constructor (props) {
		super (props);
        this.state = {
            inputValue: "",
            showSuggestions: false,
            suggestions: [],
            selectedSuggestion: 0,
            users: []
        };

        this.input = React.createRef ();
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSuggestionClick = this.handleSuggestionClick.bind(this);
    }

    componentDidMount() {
        (async () => {
            this.props?.channelData?.forEach(async (user ) => {
                await axios.get(`${baseURL}/api/user/${user.user_id}`)
                .then(res => {
                    if(this.state.users.find(user => user?.user_id === res?.data?.user?.user_id)) return;
                    this.setState({
                        users: [...this.state.users, res.data.user]
                    })
                   
                })
                .catch(err => {
                    console.log(err);
                })
            })
        })()
    }
   


    handleInputChange(e) {
        const { value } = e.target;
        if(value.length > 0 && value.lastIndexOf("@") > -1) {
            let lastAt = value.lastIndexOf("@");
            let lastSpace = value.lastIndexOf(" ");
            if(lastSpace > lastAt) {
                this.setState({
                    showSuggestions: false,
                    suggestions: []
                });
                this.props.handleInputChange(value);
                return;
            }
            let query = value.slice(lastAt + 1);
            let suggestions = this.state.users.filter(user => user.name.toLowerCase().includes(query.toLowerCase()));
            this.setState({
                showSuggestions: true,
                suggestions: suggestions
            });
        } else {
            this.setState({
                showSuggestions: false,
                suggestions: []
            });
        }
        this.props.handleInputChange(value);
    }

    handleSuggestionClick(suggestion) {
        let { inputValue } = this.props;
        let lastAt = inputValue.lastIndexOf("@");
        let lastSpace = inputValue.lastIndexOf(" ");
        if(lastSpace > lastAt) {
            this.setState({
                showSuggestions: false,
                suggestions: []
            });
            return;
        }
        let query = inputValue.slice(lastAt + 1);
        if(query.length === 0){
            this.setState({
                showSuggestions: false,
                suggestions: []
            });
            let newInputValue = inputValue + suggestion.name;
            this.props.handleInputChange(newInputValue);
            return;
        }

        let newInputValue = inputValue.replace(query, suggestion.name);
        this.props.handleInputChange(newInputValue);
        this.setState({
            showSuggestions: false,
            suggestions: []
        });
    }



  
	render(){
        // console.log(this.props);
        if(this.props?.index === null) return null;
        return (
        <>
        <div className = "message-editior">
            {/* Suggestions */}
            {this.state.showSuggestions && this.state.suggestions.length > 0 && (
                <div style={{position: "absolute", zIndex: 1000, width: "96%", backgroundColor: "white", maxHeight: "200px", overflowY: "auto", border: "1px solid lightgray", bottom: "60px"}}>
                    {this.state.suggestions.map((suggestion, index) => {
                        return (
                            <div key={index} style={{padding: "5px", backgroundColor: this.state.selectedSuggestion === index ? "lightgray" : "white"}} onClick={() => this.handleSuggestionClick(suggestion)}>
                                {suggestion.name}
                            </div>
                        )
                    })}
                </div>
            )}


            <div className = "msg-editor" title = "Write your message here.">
                 {/* Message value */}
                <input 
                ref = {this.input} 
                type = "text" 
                placeholder="Send a message..."
                onKeyDown={this.props.handleKeyDown}
                onChange={(e) => this.handleInputChange(e)}
                value={this.props.inputValue}
                />
            </div>

            {/* Typing status */}
            {this.state.isTyping && this.state.typingUsers.length > 0 && (
                <div style={{position: "absolute", zIndex: 1000, width: "96%", backgroundColor: "white", maxHeight: "200px", overflowY: "auto", border: "1px solid lightgray", bottom: "60px"}}>
                    {this.state.typingUsers.map((user, index) => {
                        return (
                            <div key={index} style={{padding: "5px", backgroundColor: "white"}}>
                                {user.name} is typing...
                            </div>
                        )
                    })}
                </div>
            )}


            <div className = "sender-icon" title = "Send this message." onClick = {this.props.sendMessage}>
            <svg viewBox = "0 0 24 24" width = "36px" height = "36px" fill = "silver">
                <g><path d = {`M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,
                1.7,1.5,1.2l17.9-9 C22.2,12.5,22.2,11.5,21.5,11.1z`}/></g>
            </svg>
        </div>
           
        </div>
        </>
        );
    }
}