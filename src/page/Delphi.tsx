import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import delphiManagementService from "../services/delphiService";

interface Message {
  text: string;
  sender: string;
}

interface User {
  name: string;
  email: string;
  programType: string;
}

const users = [
  { name: "Deepak", email: "deepak02@iotasol.com", programType: "Accelerate" },
  { name: "Avtar", email: "avtar@iotasol.com", programType: "Free" },
  { name: "Regina", email: "regina@iotasol.com", programType: "Free" },
];

const Delphi = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDisableInput, setIsDisableInput] = useState(false);
  const [isButtonDisable, setIsButtonDisable] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isButtonDisable) return;
    setIsButtonDisable(true);
    if (
      selectedUser?.programType === "Free" &&
      messages.filter((msg) => msg.sender === "USER").length >= 2
    ) {
      console.log("please upgrade your plan");
      setIsDisableInput(true);
      setInputValue("");
      setIsButtonDisable(false);
      return;
    }
    setMessages([
      ...messages,
      { text: inputValue, sender: "USER" },
      { text: "please wait...", sender: "CLONE" },
    ]);
    setInputValue("");
    await delphiManagementService.createMessages({
      conversation_id: conversationId,
      user_message: inputValue,
    });
    const mess = await delphiManagementService.getConversation(conversationId);
    setMessages(mess.data.data.history);
    setIsButtonDisable(false);
  };

  const parseTextWithUserCallouts = (text: string): JSX.Element[] => {
    const calloutPattern = /\[\d+\]/g;
    const parts = text.split(calloutPattern);
    const callouts = text.match(calloutPattern);
  
    return parts.reduce<JSX.Element[]>((acc, part, index) => {
      acc.push(<span key={`part-${index}`}>{part}</span>);
      if (callouts && callouts[index]) {
        const calloutNumber = callouts[index].slice(1, -1); // Remove the brackets
        acc.push(
          <sup key={`callout-${index}`} className="callout">
            {calloutNumber}
          </sup>
        );
      }
      return acc;
    }, []);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsDisableInput(false)
    const selectedIndex = event.target.selectedIndex;
    setSelectedUser(selectedIndex > 0 ? users[selectedIndex - 1] : null);
    selectedIndex > 0
      ? setMessages([{ text: "please wait...", sender: "CLONE" }])
      : setMessages([]);
  };

  const createConversation = useCallback(async () => {
    try {
      const userEmail = selectedUser?.email;
      setIsButtonDisable(true);

      if (!userEmail) {
        console.error("Error: User email is missing");
        setIsButtonDisable(false);
        return;
      }

      // Check if the conversation_id exists in local storage
      const storedConversation = localStorage.getItem(userEmail);
      if (storedConversation) {
        const parsedConversation = JSON.parse(storedConversation);
        const conversationId = parsedConversation.conversation_id;
        // Fetch the conversation with the stored conversation_id
        const messages = await delphiManagementService.getConversation(
          conversationId
        );
        setMessages(messages.data.data.history);
        setConversationId(conversationId);
        setIsButtonDisable(false);
        return;
      }

      // If conversation_id does not exist, create a new conversation
      const res = await delphiManagementService.createConversation({
        slug: "wwwpanalitixcom",
        user_email: userEmail,
      });

      const newConversationId = res.data.data.conversation.new.conversation_id;

      // Save the new conversation_id to local storage
      localStorage.setItem(
        userEmail,
        JSON.stringify({
          conversation_id: newConversationId,
        })
      );

      setConversationId(newConversationId);
      setMessages(res.data.data.conversation.new.messages);
      setIsButtonDisable(false);
    } catch (error) {
      setIsButtonDisable(false);
      console.error("Error:", error);
    }
  }, [selectedUser?.email]);

  useEffect(() => {
    if (selectedUser) {
      createConversation();
    }
  }, [selectedUser, createConversation]);

  return (
    <MainContainer>
      <ConversationContainer>
        <Header>
            <Avatar
              src="https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?size=338&ext=jpg&ga=GA1.1.44546679.1716940800&semt=sph"
              alt="Avatar"
            />
            <HeaderInfo>
              <Name>Deepak Kumar</Name>
              <Position>Cofounder of Delphi</Position>
            </HeaderInfo>
            {isDisableInput && (
              <UpdgradPlan>please upgrade your plan</UpdgradPlan>
            )}
        </Header>
        <MessageList>
          {!selectedUser && <SelectUserStyle>please select user</SelectUserStyle>}
          {messages.map((message, index) => (
            <MessageContainer key={index}>
              <Conversation $isuser={message.sender}>
                {parseTextWithUserCallouts(message.text)}
              </Conversation>
            </MessageContainer>
          ))}
        </MessageList>
        {!isDisableInput && selectedUser && (
          <InputContainer>
            <Input
              type="text"
              placeholder="Ask me any question"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button onClick={handleSendMessage} disabled={isButtonDisable}>
              Send
            </Button>
          </InputContainer>
        )}
      </ConversationContainer>
      <UserContainer>
        <Dropdown onChange={handleSelectChange}>
          <option value="">Select a user</option>
          {users.map((user, index) => (
            <option key={index} value={user.name}>
              {user.name}
            </option>
          ))}
        </Dropdown>
        {selectedUser && (
          <SelectUser>
            <P>Email : {selectedUser.email}</P>
            <P>Program Type : {selectedUser.programType}</P>
          </SelectUser>
        )}
      </UserContainer>
    </MainContainer>
  );
};

const UpdgradPlan = styled.div`
  text-align: center;
  color: red;
  width: 50%;
`;
const SelectUserStyle = styled.div`
    text-align: center;
  color: red;
  width: 100%;

`
const SelectUser = styled.div`
  padding: 10px 20px;
`;

const P = styled.p`
  margin-bottom: 10px;
`;

const Dropdown = styled.select`
  padding: 10px;
  font-size: 16px;
  width: 100%;
  outline: none;
  border-left: none;
  border-top: none;
  border-right: none;
  border-bottom: 1px solid #ccc;
  border-radius: 0 8px 0 0;
`;

const MainContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 20px auto;
  display: flex;
  padding: 20px;
`;
const UserContainer = styled.div`
  border: 1px solid #ccc;
  border-left: none;
  width: 30%;
  border-radius: 0 8px 8px 0;
  height: 115px;
`;

const ConversationContainer = styled.div`
  width: 70%;
  border: 1px solid #ccc;
  border-radius: 8px 0 0 8px;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-weight: bold;
`;

const Position = styled.span`
  font-size: 12px;
  color: #777;
`;

const MessageList = styled.div`
  padding: 10px;
  height: 70vh;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const Conversation = styled.pre<{ $isuser: string }>`
  background-color: ${({ $isuser }) =>
    $isuser === "USER" ? "#ff5722" : "#f5f5f5"};
  color: ${({ $isuser }) => ($isuser === "USER" ? "#fff" : "#000")};
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  max-width: 80%;
  align-self: ${({ $isuser }) =>
    $isuser === "USER" ? "flex-end" : "flex-start"};
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.4;

  .callout {
    display: inline-block;
    background-color: #e0e0e0;
    color: #000;
    padding: 2px 9px;
    border-radius: 12px;
    margin: 2px 0px;
    font-size: 0.7em;
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-top: 1px solid #ccc;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  padding: 5px;
  font-size: 14px;
  outline: none;
`;

const Button = styled.button`
  background-color: #ff5722;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #e64a19;
  }
`;

export default Delphi;
