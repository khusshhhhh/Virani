// const BASE_URL = "http://localhost:5000"; // Backend API base URL

// Utility to show loading state
function showLoadingState(element) {
  element.innerHTML = "<p>Loading...</p>";
}

// Utility to handle fetch errors
async function handleFetchError(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
}
