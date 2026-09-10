import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiRequest } from "../services/api";

interface Event {
    id: number;
    title: string;
    short_description: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    organizer_name: string;
    capacity: number;
    status: string;
    created_at: string;
}

function EventDetailsPage() {
    const { id } = useParams();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setError("");

                const data = await apiRequest(`/events/${id}`);

                setEvent(data.event);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Не вдалося завантажити захід"
                );
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id]);

    const handleRegistration = async () => {
        try {
            setError("");
            setSuccess("");
            setRegistering(true);

            await apiRequest(`/registrations/${id}`, {
                method: "POST"
            });

            setSuccess(
                "Ви успішно зареєструвалися на захід."
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Не вдалося зареєструватися на захід"
            );
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження заходу...
                    </div>
                </div>
            </main>
        );
    }

    if (error && !event) {
        return (
            <main className="page">
                <div className="container">
                    <div className="error">
                        {error}
                    </div>

                    <Link
                        className="btn btn-secondary event-back-btn"
                        to="/events"
                    >
                        Повернутися до заходів
                    </Link>
                </div>
            </main>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <main className="page">
            <div className="container">
                <Link
                    className="back-link"
                    to="/events"
                >
                    ← До списку заходів
                </Link>

                <div className="event-details card">
                    <h1 className="page-title">
                        {event.title}
                    </h1>

                    <p className="event-details-short">
                        {event.short_description}
                    </p>

                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success">
                            {success}
                        </div>
                    )}

                    <div className="event-details-info">
                        <div className="event-detail-item">
                            <span>Дата</span>
                            <strong>
                                {event.event_date}
                            </strong>
                        </div>

                        <div className="event-detail-item">
                            <span>Час</span>
                            <strong>
                                {event.event_time.slice(0, 5)}
                            </strong>
                        </div>

                        <div className="event-detail-item">
                            <span>Місце</span>
                            <strong>
                                {event.location}
                            </strong>
                        </div>

                        <div className="event-detail-item">
                            <span>Організатор</span>
                            <strong>
                                {event.organizer_name}
                            </strong>
                        </div>

                        <div className="event-detail-item">
                            <span>Кількість місць</span>
                            <strong>
                                {event.capacity}
                            </strong>
                        </div>
                    </div>

                    <div className="event-full-description">
                        <h2>Опис заходу</h2>

                        <p>
                            {event.description}
                        </p>
                    </div>

                    <div className="event-details-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleRegistration}
                            disabled={registering || !!success}
                        >
                            {registering
                                ? "Реєстрація..."
                                : success
                                    ? "Ви зареєстровані"
                                    : "Зареєструватися"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default EventDetailsPage;