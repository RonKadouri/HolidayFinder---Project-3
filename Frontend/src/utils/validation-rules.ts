// Form validation rules shared by the login and register pages.
// They match the backend rules, so the server rarely has to reject a form.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // something@something.domain
const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 4;
const PRICE_MAX = 10000;

export const validationRules = {

    firstName: {
        required: "First name is required.",
        minLength: { value: NAME_MIN_LENGTH, message: `First name must be at least ${NAME_MIN_LENGTH} characters.` }
    },

    lastName: {
        required: "Last name is required.",
        minLength: { value: NAME_MIN_LENGTH, message: `Last name must be at least ${NAME_MIN_LENGTH} characters.` }
    },

    email: {
        required: "Email is required.",
        pattern: { value: EMAIL_PATTERN, message: "Please enter a valid email." }
    },

    password: {
        required: "Password is required.",
        minLength: { value: PASSWORD_MIN_LENGTH, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` }
    },

    destination: {
        required: "Destination is required.",
        minLength: { value: 2, message: "Destination must be at least 2 characters." }
    },

    description: {
        required: "Description is required.",
        minLength: { value: 2, message: "Description must be at least 2 characters." }
    },

    price: {
        required: "Price is required.",
        valueAsNumber: true as const,
        min: { value: 0, message: "Price can't be negative." },
        max: { value: PRICE_MAX, message: `Price can't be over $${PRICE_MAX}.` }
    },

    image: {
        required: "Image is required."
    }

};
