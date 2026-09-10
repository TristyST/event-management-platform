import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
}

function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setError("");

                const data = await apiRequest("/events");

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

        loadEvents();
    }, []);

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження заходів...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page">
            <div className="container">
                <h1 className="page-title">
                    Доступні заходи
                </h1>

                <p className="page-subtitle">
                    Переглядайте доступні заходи та реєструйтеся
                    на цікаві події.
                </p>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {!error && events.length === 0 && (
                    <div className="card">
                        <h2>Заходів поки немає</h2>

                        <p>
                            Опубліковані заходи з'являться тут.
                        </p>
                    </div>
                )}

                {events.length > 0 && (
                    <div className="events-grid">
                        {events.map((event) => (
                            <article
                                className="card event-card"
                                key={event.id}
                            >
                                <div className="event-card-content">
                                    <h2 className="event-title">
                                        {event.title}
                                    </h2>

                                    <p className="event-description">
                                        {event.short_description}
                                    </p>

                                    <div className="event-info">
                                        <div>
                                            <strong>Дата:</strong>{" "}
                                            {event.event_date}
                                        </div>

                                        <div>
                                            <strong>Час:</strong>{" "}
                                            {event.event_time.slice(0, 5)}
                                        </div>

                                        <div>
                                            <strong>Місце:</strong>{" "}
                                            {event.location}
                                        </div>

                                        <div>
                                            <strong>Організатор:</strong>{" "}
                                            {event.organizer_name}
                                        </div>

                                        <div>
                                            <strong>Місць:</strong>{" "}
                                            {event.capacity}
                                        </div>
                                    </div>

                                    <Link
                                        className="btn btn-primary"
                                        to={`/events/${event.id}`}
                                    >
                                        Детальніше
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

export default EventsPage;