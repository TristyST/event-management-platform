import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (data.user.role === "organizer") {
                navigate("/organizer");
            } else {
                navigate("/events");
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка входу"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page">
            <div className="container">
                <div className="auth-card card">
                    <h1 className="page-title">Вхід</h1>

                    <p className="page-subtitle">
                        Увійдіть до свого облікового запису
                    </p>

                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}

                    <form
                        className="form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="email"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                className="form-input"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="password"
                            >
                                Пароль
                            </label>

                            <input
                                id="password"
                                className="form-input"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Вхід..." : "Увійти"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Немає облікового запису?{" "}
                        <Link to="/register">
                            Зареєструватися
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;