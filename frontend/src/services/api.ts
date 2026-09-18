const API_URL = "http://localhost:3000/api";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        (headers as Record<string, string>).Authorization =
            `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;

    console.log("API request:", {
        url,
        method: options.method || "GET"
    });

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            headers
        });
    } catch (error) {
        console.error("API fetch error:", error);
        throw error;
    }

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Помилка сервера"
        );
    }

    return data;
}