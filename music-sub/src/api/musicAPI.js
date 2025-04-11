import axios from "axios";

const API_URL =
  "https://04456aftih.execute-api.us-east-1.amazonaws.com/fetch/fetch";

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

export const loginUser = async(email, password) => {
  try{
    const response = await axios.post(API_URL, {type: 'get', email, password});

    const data = response.data;
    if(data.statusCode === 200){
      console.log(data);
      return data;
    }
    else{
      console.log(data);
      console.log(data.body);
      throw new Error(data.body.toString() || "Login failed");
    }
  }catch (error) {
    throw new Error(
        error.response?.data?.message || error.message || "Something went wrong."
    );
  }
};

// Function to build the objectKey
const buildKey = (song) => {
  return `${song.artist}-${song.album}-${song.title}`;
};

export async function generatePresignedURL(songs, concurrency = 8) {
  const results = new Array(songs.length);
  let index = 0;

  async function worker() {
    while (index < songs.length) {
      const currentIndex = index++;
      const song = songs[currentIndex];
      const objectKey = buildKey(song);

      try {
        console.log("Requesting presigned URL for objectKey:", objectKey);
        const response = await axios.post(API_URL, {
          type: "getImage",
          body: JSON.stringify({ objectKey }),
        });
        console.log("GET IMAGE response data:", response.data);

        let data = response.data;
        if (data.body) {
          try {
            data = JSON.parse(data.body);
          } catch (parseError) {
            console.error("Error parsing response body:", data.body, parseError);
          }
        }

        if (data.presignedUrl) {
          results[currentIndex] = { ...song, img_url: data.presignedUrl };
        } else {
          console.error("No presignedUrl found for objectKey", objectKey, data);
          results[currentIndex] = { ...song, img_url: null };
        }
      } catch (error) {
        console.error("Error fetching presigned URL for", objectKey, error.response || error);
        results[currentIndex] = { ...song, img_url: null };
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
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
