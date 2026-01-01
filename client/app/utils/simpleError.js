// app/utils/simpleError.js
const simpleError = (err) => {
    console.error('Error handler:', err);

    if (!err) {
        return 'An unknown error occurred';
    }

    // If it's an axios error
    if (err.response) {
        // Return server error message
        if (err.response.data && err.response.data.error) {
            return err.response.data.error;
        }
        if (err.response.data && err.response.data.message) {
            return err.response.data.message;
        }
        return `Server error: ${err.response.status}`;
    } else if (err.request) {
        // No response received
        return 'No response from server. Please check your connection.';
    } else {
        // Request setup error
        return err.message || 'An error occurred';
    }
};

export default simpleError;