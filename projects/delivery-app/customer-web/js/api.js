const API = {

    BASE_URL: "http://localhost:3000/api",

    async get(endpoint) {

        const res =
            await fetch(
                `${this.BASE_URL}/${endpoint}`
            );

        return await res.json();
    },

    async post(endpoint, data) {

        const res =
            await fetch(
                `${this.BASE_URL}/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

        return await res.json();
    }
};