import axios, { InternalAxiosRequestConfig } from "axios";

class Interceptor {

    public create(): void {

        // Registering a request interceptor:
        axios.interceptors.request.use((httpRequest: InternalAxiosRequestConfig) => {

            // Get the token: 
            const token = localStorage.getItem("token");

            // Save token in header: 
            if (token) {
                httpRequest.headers.Authorization = "Bearer " + token;
            }

            // Return given request so axios could send this one:
            return httpRequest;
        });

    }

}

export const interceptor = new Interceptor();
