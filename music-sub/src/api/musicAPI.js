import axios from "axios";

const API_URL =
  " https://04456aftih.execute-api.us-east-1.amazonaws.com/fetch/fetch";
const BASE_API_URL =
  "https://xtb9qbsb71.execute-api.us-east-1.amazonaws.com/Production/fetch";

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

export async function generatePresignedURL(songs) {
  return Promise.all(
    songs.map(async (song) => {
      const objectKey = buildKey(song);
      try {
        console.log("Requesting presigned URL for objectKey:", objectKey);
        const response = await axios.post(BASE_API_URL, {
          type: "getImage",
          body: JSON.stringify({ objectKey }),
        });
        console.log("GET IMAGE response data:", response.data);

        // Check if response.data has a body property that needs parsing
        let data = response.data;
        if (data.body) {
          try {
            data = JSON.parse(data.body);
          } catch (parseError) {
            console.error(
              "Error parsing response body:",
              data.body,
              parseError
            );
          }
        }

        if (data.presignedUrl) {
          return { ...song, img_url: data.presignedUrl };
        } else {
          console.error("No presignedUrl found for objectKey", objectKey, data);
          return { ...song, img_url: null };
        }
      } catch (error) {
        console.error(
          "Error fetching presigned URL for",
          objectKey,
          error.response || error
        );
        // Set to null in case of error (or you can use a placeholder URL)
        return { ...song, img_url: null };
      }
    })
  );
}
export const searchSongs = async (title, artist, year, album) => {
  try {
    const response = await axios.post(API_URL, {
      type: "searchSongs",
      title,
      artist,
      year,
      album,
    });

    const data = response.data;
    if (data.statusCode === 200) {
      const parsedBody = JSON.parse(data.body);
      return parsedBody.items;
    } else {
      throw new Error(data.message || "Failed");
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Something went wrong."
    );
  }
};
