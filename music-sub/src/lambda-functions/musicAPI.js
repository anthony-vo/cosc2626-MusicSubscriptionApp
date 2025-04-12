import axios from "axios";

const API_URL =
  "https://oc1t0cy4aj.execute-api.us-east-1.amazonaws.com/prod";

export const registerUser = async (email, user_name, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      user_name,
      password,

    });

    return response.data;
  } catch (error) {
    const errMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";

    throw new Error(errMessage);
  }
};


export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    const data = response.data;

    // Login success, return user data
    console.log(data);
    return data;

  } catch (error) {
    // Handle actual backend errors
    const errMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";
    console.log("Login error:", errMessage);
    throw new Error(errMessage);
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

        // Sending the GET request with the objectKey as a query parameter
        const response = await axios.get(`${API_URL}/getImage`, {
          params: { objectKey },  // Send objectKey as query parameter
        });

        console.log("GET IMAGE response data:", response.data);

        let data = response.data;

        // If the response body contains the presigned URL
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

  // Create an array of workers with the specified concurrency limit
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);  // Wait for all workers to finish

  return results;
}

export const searchSongs = async (title, artist, year, album) => {
  try {
    const response = await axios.get(`${API_URL}/searchSongs`, {
      params: { title, artist, year, album },
    });

    const data = response.data;

    // Handle both direct and stringified body formats
    if (data.items) {
      return data.items;
    }

    if (data.body) {
      const parsedBody = JSON.parse(data.body);
      return parsedBody.items;
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    throw new Error(
        error.response?.data?.error || error.message || "Search failed."
    );
  }
};
