import { api } from "@/lib/axios";

const defaultUrl = "/public/invite";

export const publicApi = {
    
    validate: async (data : {
        invitationCode : string
    }) => {

        const response =
            await api.post(
                defaultUrl + "/validate",
                data
            );


        return response.data;
    },

    confirm: async (data : {
        invitationCode : string,
        password : string
    }) => {

        const response =
            await api.post(
                defaultUrl + "/confirm",
                data
            );


        return response.data;
    },
};