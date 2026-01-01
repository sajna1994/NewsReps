// Import news actions
import { actions as newsActions } from './News';

// Combine all actions
export default {
    ...signupActions,
    ...loginActions,
    ...navigationActions,
    // ... other actions
    ...newsActions  // Add this line
};