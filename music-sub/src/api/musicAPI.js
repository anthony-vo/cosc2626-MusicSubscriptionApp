import axios from 'axios';

const API_URL = 'https://xpbtobv7s1.execute-api.us-east-1.amazonaws.com/user/music-app-login';

export const registerUser = async (email, password, user_name) => {
    try {
        const response = await axios.post(API_URL, {
            type: 'post',
            email,
            password,
            user_name
        });

        // Handle response
        const data = response.data;
        if (data.statusCode === 200) {
            return data;
        } else {
            throw new Error(data.message || "Email already in use");
        }

    } catch (error) {
        throw new Error(
            error.response?.data?.message || error.message || "Something went wrong."
        );
    }
};
