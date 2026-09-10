import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("participant");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            });

            navigate("/login");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Помилка реєстрації"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page">
            <div className="container">
                <div className="auth-card card">
                    <h1 className="page-title">
                        Реєстрація
                    </h1>

                    <p className="page-subtitle">
                        Створіть новий обліковий запис
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
                                htmlFor="name"
                            >
                                Ім'я
                            </label>

                            <input
                                id="name"
                                className="form-input"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />
                        </div>

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

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="role"
                            >
                                Тип облікового запису
                            </label>

                            <select
                                id="role"
                                className="form-select"
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                            >
                                <option value="participant">
                                    Учасник
                                </option>

                                <option value="organizer">
                                    Організатор
                                </option>
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Реєстрація..."
                                : "Зареєструватися"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Вже маєте обліковий запис?{" "}
                        <Link to="/login">
                            Увійти
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;