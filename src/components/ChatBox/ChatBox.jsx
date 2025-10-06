import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages , chatVisible , setChatVisible } =
    useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  const convertTimestamp = (timestamp)=>{
    let date = timestamp.toDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    if(hour > 12){
      return hour-12 + ":" + minute + " PM"
    }
    else{
      return hour + ":" + minute + " AM"
    }
  }

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub;
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className="arrow" alt="" />
        <img src={assets.profile_img} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className="dot" src={assets.green_dot} alt="" /> : null }
        </p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              <p className="msg">{msg.text}</p>
              <div>
                <img
                  src={msg.sId === userData.id ? assets.avatar_icon : assets.avatar_icon}
                  alt=""
                />
                <p>{convertTimestamp(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a Message"
        />
        <input type="file" id="image" accept="image/png, image/jpeg," hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
