import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api";

interface Registration {
    id: number;
    registered_at: string;
    event_id: number;
    title: string;
    short_description: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    capacity: number;
    status: "draft" | "published" | "completed";
    organizer_name: string;
}

function MyEventsPage() {
    const [registrations, setRegistrations] = useState<
        Registration[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [feedbackEventId, setFeedbackEventId] =
        useState<number | null>(null);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const [feedbackLoading, setFeedbackLoading] =
        useState(false);

    const [feedbackSuccess, setFeedbackSuccess] =
        useState<number | null>(null);

    useEffect(() => {
        const loadMyEvents = async () => {
            try {
                setError("");

                const data = await apiRequest(
                    "/registrations/my"
                );

                setRegistrations(
                    data.registrations || []
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Не вдалося завантажити ваші заходи"
                );
            } finally {
                setLoading(false);
            }
        };

        loadMyEvents();
    }, []);

    const getStatusLabel = (
        status: Registration["status"]
    ) => {
        switch (status) {
            case "published":
                return "Опубліковано";

            case "completed":
                return "Завершено";

            case "draft":
                return "Чернетка";

            default:
                return status;
        }
    };

    const handleFeedbackSubmit = async (
        eventId: number
    ) => {
        try {
            setError("");
            setFeedbackLoading(true);

            await apiRequest(`/feedback/${eventId}`, {
                method: "POST",
                body: JSON.stringify({
                    rating,
                    comment
                })
            });

            setFeedbackSuccess(eventId);
            setFeedbackEventId(null);
            setComment("");
            setRating(5);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося залишити відгук"
            );
        } finally {
            setFeedbackLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження ваших заходів...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page">
            <div className="container">
                <h1 className="page-title">
                    Мої заходи
                </h1>

                <p className="page-subtitle">
                    Заходи, на які ви зареєструвалися.
                </p>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {!error && registrations.length === 0 && (
                    <div className="card empty-state">
                        <h2>
                            Ви ще не зареєстровані на заходи
                        </h2>

                        <p>
                            Перегляньте доступні заходи та
                            оберіть цікаву для вас подію.
                        </p>

                        <Link
                            className="btn btn-primary"
                            to="/events"
                        >
                            Переглянути заходи
                        </Link>
                    </div>
                )}

                {registrations.length > 0 && (
                    <div className="events-grid">
                        {registrations.map(
                            (registration) => (
                                <article
                                    className="card event-card"
                                    key={registration.id}
                                >
                                    <div className="event-card-content">
                                        <div className="event-status">
                                            {getStatusLabel(
                                                registration.status
                                            )}
                                        </div>

                                        <h2 className="event-title">
                                            {registration.title}
                                        </h2>

                                        <p className="event-description">
                                            {
                                                registration.short_description
                                            }
                                        </p>

                                        <div className="event-info">
                                            <div>
                                                <strong>
                                                    Дата:
                                                </strong>{" "}
                                                {
                                                    registration.event_date
                                                }
                                            </div>

                                            <div>
                                                <strong>
                                                    Час:
                                                </strong>{" "}
                                                {registration.event_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </div>

                                            <div>
                                                <strong>
                                                    Місце:
                                                </strong>{" "}
                                                {
                                                    registration.location
                                                }
                                            </div>

                                            <div>
                                                <strong>
                                                    Організатор:
                                                </strong>{" "}
                                                {
                                                    registration.organizer_name
                                                }
                                            </div>
                                        </div>

                                        <Link
                                            className="btn btn-primary"
                                            to={`/events/${registration.event_id}`}
                                        >
                                            Детальніше
                                        </Link>

                                        {registration.status ===
                                            "completed" &&
                                            feedbackSuccess !==
                                                registration.event_id && (
                                                <div className="feedback-form">
                                                    {feedbackEventId ===
                                                    registration.event_id ? (
                                                        <>
                                                            <h3>
                                                                Залишити
                                                                відгук
                                                            </h3>

                                                            <div className="form-group">
                                                                <label
                                                                    className="form-label"
                                                                    htmlFor={`rating-${registration.event_id}`}
                                                                >
                                                                    Оцінка
                                                                </label>

                                                                <select
                                                                    id={`rating-${registration.event_id}`}
                                                                    className="form-select"
                                                                    value={
                                                                        rating
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        setRating(
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="5">
                                                                        5 — Відмінно
                                                                    </option>

                                                                    <option value="4">
                                                                        4 — Добре
                                                                    </option>

                                                                    <option value="3">
                                                                        3 — Задовільно
                                                                    </option>

                                                                    <option value="2">
                                                                        2 — Погано
                                                                    </option>

                                                                    <option value="1">
                                                                        1 — Дуже погано
                                                                    </option>
                                                                </select>
                                                            </div>

                                                            <div className="form-group">
                                                                <label
                                                                    className="form-label"
                                                                    htmlFor={`comment-${registration.event_id}`}
                                                                >
                                                                    Коментар
                                                                </label>

                                                                <textarea
                                                                    id={`comment-${registration.event_id}`}
                                                                    className="form-textarea"
                                                                    value={
                                                                        comment
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        setComment(
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="Поділіться своїми враженнями..."
                                                                />
                                                            </div>

                                                            <div className="feedback-form-actions">
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setFeedbackEventId(
                                                                            null
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        feedbackLoading
                                                                    }
                                                                >
                                                                    Скасувати
                                                                </button>

                                                                <button
                                                                    className="btn btn-primary"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleFeedbackSubmit(
                                                                            registration.event_id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        feedbackLoading
                                                                    }
                                                                >
                                                                    {feedbackLoading
                                                                        ? "Надсилання..."
                                                                        : "Надіслати відгук"}
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="btn btn-secondary"
                                                            type="button"
                                                            onClick={() =>
                                                                setFeedbackEventId(
                                                                    registration.event_id
                                                                )
                                                            }
                                                        >
                                                            Залишити відгук
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                        {feedbackSuccess ===
                                            registration.event_id && (
                                            <div className="success feedback-success">
                                                Дякуємо! Ваш відгук
                                                успішно додано.
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default MyEventsPage;