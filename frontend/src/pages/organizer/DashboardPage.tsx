import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../services/api";

interface Event {
    id: number;
    title: string;
    short_description: string;
    event_date: string;
    event_time: string;
    location: string;
    capacity: number;
    status: "draft" | "published" | "completed";
}

function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadEvents = async () => {
        try {
            setError("");

            const data = await apiRequest("/events/my");

            setEvents(data.events || []);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося завантажити заходи"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const getStatusLabel = (
        status: Event["status"]
    ) => {
        switch (status) {
            case "draft":
                return "Чернетка";

            case "published":
                return "Опубліковано";

            case "completed":
                return "Завершено";

            default:
                return status;
        }
    };

    const handlePublish = async (id: number) => {
        try {
            setError("");

            await apiRequest(`/events/${id}/publish`, {
                method: "POST"
            });

            await loadEvents();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося опублікувати захід"
            );
        }
    };

    const handleComplete = async (id: number) => {
        try {
            setError("");

            await apiRequest(`/events/${id}/complete`, {
                method: "POST"
            });

            await loadEvents();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося завершити захід"
            );
        }
    };

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження панелі організатора...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page">
            <div className="container">
                <div className="organizer-header">
                    <div>
                        <h1 className="page-title">
                            Панель організатора
                        </h1>

                        <p className="page-subtitle">
                            Керуйте створеними заходами.
                        </p>
                    </div>

                    <Link
                        className="btn btn-primary"
                        to="/organizer/events/create"
                    >
                        + Створити захід
                    </Link>
                </div>

                {error && (
                    <div className="error organizer-message">
                        {error}
                    </div>
                )}

                {events.length === 0 && !error && (
                    <div className="card empty-state">
                        <h2>
                            Ви ще не створили жодного заходу
                        </h2>

                        <p>
                            Створіть свій перший захід, щоб
                            він з'явився у списку.
                        </p>

                        <Link
                            className="btn btn-primary"
                            to="/organizer/events/create"
                        >
                            Створити захід
                        </Link>
                    </div>
                )}

                {events.length > 0 && (
                    <div className="organizer-events">
                        {events.map((event) => (
                            <article
                                className="card organizer-event"
                                key={event.id}
                            >
                                <div className="organizer-event-main">
                                    <div className="event-status">
                                        {getStatusLabel(
                                            event.status
                                        )}
                                    </div>

                                    <h2 className="event-title">
                                        {event.title}
                                    </h2>

                                    <p className="event-description">
                                        {event.short_description}
                                    </p>

                                    <div className="event-info">
                                        <div>
                                            <strong>
                                                Дата:
                                            </strong>{" "}
                                            {event.event_date}
                                        </div>

                                        <div>
                                            <strong>
                                                Час:
                                            </strong>{" "}
                                            {event.event_time.slice(
                                                0,
                                                5
                                            )}
                                        </div>

                                        <div>
                                            <strong>
                                                Місце:
                                            </strong>{" "}
                                            {event.location}
                                        </div>

                                        <div>
                                            <strong>
                                                Місць:
                                            </strong>{" "}
                                            {event.capacity}
                                        </div>
                                    </div>
                                </div>

                                <div className="organizer-event-actions">
                                    {event.status !== "completed" && (
                                        <Link
                                            className="btn btn-secondary"
                                            to={`/organizer/events/${event.id}/edit`}
                                        >
                                            Редагувати
                                        </Link>
                                    )}

                                    {event.status === "draft" && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                handlePublish(
                                                    event.id
                                                )
                                            }
                                        >
                                            Опублікувати
                                        </button>
                                    )}

                                    {event.status === "published" && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                handleComplete(
                                                    event.id
                                                )
                                            }
                                        >
                                            Завершити
                                        </button>
                                    )}

                                    <Link
                                        className="btn btn-secondary"
                                        to={`/organizer/events/${event.id}/participants`}
                                    >
                                        Учасники
                                    </Link>

                                    <Link
                                        className="btn btn-secondary"
                                        to={`/organizer/events/${event.id}/feedback`}
                                    >
                                        Відгуки
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default DashboardPage;