import axios from "axios";

const BASE_URL = "https://delphiback.onrender.com/";

interface ICreateConversation {
  slug: string;
  user_email ?: string
}

interface ICreateMessages {
    conversation_id : string,
    user_message: string;   
  }

const createConversation = async (slug: ICreateConversation) => {
  return await axios.post(`${BASE_URL}/delphi/createConversation`, slug);
};

const createMessages = async (message: ICreateMessages) => {
    await axios.post(`${BASE_URL}/delphi/createMessages`, message);
  };

const getConversation = async (id?: string) => {
  return await axios.get(`${BASE_URL}/delphi/getConversation/${id}`);
};


const delphiManagementService = {
  createConversation,
  createMessages,
  getConversation
};
export default delphiManagementService;
