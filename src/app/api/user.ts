import { api } from "@/lib/axios";

const defaultUrl = "/api/users";

export const userApi = {
    
    me: async () => {

        const response =
            await api.get(
                defaultUrl + "/me"
            );


        return response.data;
    },

    updateProfileOnboarding: async (data: {
        firstName: string;
        lastName: string;
    }) => {
        const response = await api.put(
            defaultUrl + "/update-profile-onboarding",
            data
        );

        return response.data;
    },

};