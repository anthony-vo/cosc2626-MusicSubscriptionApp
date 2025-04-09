import axios from "axios";

const API_URL =
  "https://xpbtobv7s1.execute-api.us-east-1.amazonaws.com/user/music-app-login";
const GET_IMAGE_API =
  "https://ziwqlob0vj.execute-api.us-east-1.amazonaws.com/Production/Task5LambdaGetImage";

export const registerUser = async (email, password, user_name) => {
  try {
    const response = await axios.post(API_URL, {
      type: "post",
      email,
      password,
      user_name,
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

// Function to build the objectKey
const buildKey = (song) => {
  return `${song.artist}-${song.album}-${song.title}`;
};

// Calling API for lambda function handling the generation of presigned URL
export const generatePresignedURL = async (objectKey) => {
  try {
    const response = await axios.post(GET_IMAGE_API, { objectKey });
    // Return from lambda is the presigned URL
    return response.data.presignedURL;
  } catch (error) {
    console.error("Error in retrieving for: ", objectKey, error);
    return objectKey;
  }
};

// convert img_url in dynamoDB to presigned URL from S3
export const convertSongsWithPresignedURL = async (songs) => {
  return await Promise.all(
    songs.map(async (song) => {
      const objectKey = buildKey(song);
      const presignedURL = await generatePresignedURL(objectKey);
      return { ...song, img_url: presignedURL };
    })
  );
};
