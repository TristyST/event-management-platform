import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../../services/api";

function CreateEventPage() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] =
        useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await apiRequest("/events", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    short_description: shortDescription,
                    description,
                    event_date: eventDate,
                    event_time: eventTime,
                    location,
                    capacity: Number(capacity)
                })
            });

            navigate("/organizer");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося створити захід"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page">
            <div className="container">
                <Link
                    className="back-link"
                    to="/organizer"
                >
                    ← До панелі організатора
                </Link>

                <div className="card form-card">
                    <h1 className="page-title">
                        Створення заходу
                    </h1>

                    <p className="page-subtitle">
                        Заповніть інформацію про новий захід.
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
                                htmlFor="title"
                            >
                                Назва заходу
                            </label>

                            <input
                                id="title"
                                className="form-input"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="short-description"
                            >
                                Короткий опис
                            </label>

                            <input
                                id="short-description"
                                className="form-input"
                                type="text"
                                value={shortDescription}
                                onChange={(event) =>
                                    setShortDescription(
                                        event.target.value
                                    )
                                }
                                maxLength={500}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="description"
                            >
                                Повний опис
                            </label>

                            <textarea
                                id="description"
                                className="form-textarea"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label
                                    className="form-label"
                                    htmlFor="event-date"
                                >
                                    Дата
                                </label>

                                <input
                                    id="event-date"
                                    className="form-input"
                                    type="date"
                                    value={eventDate}
                                    onChange={(event) =>
                                        setEventDate(
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label"
                                    htmlFor="event-time"
                                >
                                    Час
                                </label>

                                <input
                                    id="event-time"
                                    className="form-input"
                                    type="time"
                                    value={eventTime}
                                    onChange={(event) =>
                                        setEventTime(
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="location"
                            >
                                Місце проведення
                            </label>

                            <input
                                id="location"
                                className="form-input"
                                type="text"
                                value={location}
                                onChange={(event) =>
                                    setLocation(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="capacity"
                            >
                                Кількість місць
                            </label>

                            <input
                                id="capacity"
                                className="form-input"
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(event) =>
                                    setCapacity(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <Link
                                className="btn btn-secondary"
                                to="/organizer"
                            >
                                Скасувати
                            </Link>

                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Створення..."
                                    : "Створити захід"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default CreateEventPage;