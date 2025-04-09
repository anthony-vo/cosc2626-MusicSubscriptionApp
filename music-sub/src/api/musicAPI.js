import axios from 'axios';

const API_URL = 'https://04456aftih.execute-api.us-east-1.amazonaws.com/fetch/fetch';

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

export const searchSongs = async (title, artist, year, album) => {
    try {
        const response = await axios.post(API_URL, {
            type: 'searchSongs',
            title,
            artist,
            year,
            album
        });

        const data = response.data;
        if (data.statusCode === 200) {
            const parsedBody = JSON.parse(data.body);
            return parsedBody.items;
        } else {
            throw new Error(data.message || "Failed");
        }
    }
    catch (error) {
        throw new Error(
            error.response?.data?.message || error.message || "Something went wrong."
        );
    }
};
