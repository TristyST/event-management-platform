import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiRequest } from "../../services/api";

interface EventInfo {
    id: number;
    title: string;
    capacity: number;
    registered_count: number;
}

interface Participant {
    id: number;
    registered_at: string;
    user_id: number;
    name: string;
    email: string;
}

function ParticipantsPage() {
    const { id } = useParams();

    const [event, setEvent] = useState<EventInfo | null>(null);
    const [participants, setParticipants] = useState<
        Participant[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadParticipants = async () => {
            try {
                setError("");

                const data = await apiRequest(
                    `/registrations/event/${id}`
                );

                setEvent(data.event);
                setParticipants(data.participants || []);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Не вдалося завантажити список учасників"
                );
            } finally {
                setLoading(false);
            }
        };

        loadParticipants();
    }, [id]);

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження учасників...
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
                        to="/organizer"
                    >
                        Повернутися до панелі
                    </Link>
                </div>
            </main>
        );
    }

    if (!event) {
        return null;
    }

    const placesLeft =
        event.capacity - event.registered_count;

    return (
        <main className="page">
            <div className="container">
                <Link
                    className="back-link"
                    to="/organizer"
                >
                    ← До панелі організатора
                </Link>

                <div className="participants-header">
                    <div>
                        <h1 className="page-title">
                            Учасники заходу
                        </h1>

                        <p className="page-subtitle">
                            {event.title}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="error participants-message">
                        {error}
                    </div>
                )}

                <div className="participants-stats">
                    <div className="card participant-stat">
                        <span>Зареєстровано</span>

                        <strong>
                            {event.registered_count}
                        </strong>
                    </div>

                    <div className="card participant-stat">
                        <span>Місткість</span>

                        <strong>
                            {event.capacity}
                        </strong>
                    </div>

                    <div className="card participant-stat">
                        <span>Вільних місць</span>

                        <strong>
                            {placesLeft}
                        </strong>
                    </div>
                </div>

                {participants.length === 0 ? (
                    <div className="card empty-state">
                        <h2>
                            Зареєстрованих учасників поки немає
                        </h2>

                        <p>
                            Коли користувачі зареєструються
                            на захід, вони з'являться тут.
                        </p>
                    </div>
                ) : (
                    <div className="card participants-card">
                        <div className="participants-table-wrapper">
                            <table className="participants-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Ім'я</th>
                                        <th>Email</th>
                                        <th>Дата реєстрації</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {participants.map(
                                        (
                                            participant,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    participant.id
                                                }
                                            >
                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {
                                                        participant.name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        participant.email
                                                    }
                                                </td>

                                                <td>
                                                    {new Date(
                                                        participant.registered_at
                                                    ).toLocaleString(
                                                        "uk-UA"
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default ParticipantsPage;