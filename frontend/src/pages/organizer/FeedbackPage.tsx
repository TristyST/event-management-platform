import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiRequest } from "../../services/api";

interface EventInfo {
    id: number;
    title: string;
}

interface Feedback {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user_id: number;
    user_name: string;
}

function FeedbackPage() {
    const { id } = useParams();

    const [event, setEvent] = useState<EventInfo | null>(null);
    const [feedback, setFeedback] = useState<Feedback[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                setError("");

                const data = await apiRequest(
                    `/feedback/event/${id}`
                );

                setEvent(data.event);
                setFeedback(data.feedback || []);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Не вдалося завантажити відгуки"
                );
            } finally {
                setLoading(false);
            }
        };

        loadFeedback();
    }, [id]);

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <div className="loading">
                        Завантаження відгуків...
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

    const averageRating =
        feedback.length > 0
            ? (
                  feedback.reduce(
                      (sum, item) => sum + item.rating,
                      0
                  ) / feedback.length
              ).toFixed(1)
            : "—";

    return (
        <main className="page">
            <div className="container">
                <Link
                    className="back-link"
                    to="/organizer"
                >
                    ← До панелі організатора
                </Link>

                <div className="feedback-header">
                    <h1 className="page-title">
                        Відгуки
                    </h1>

                    <p className="page-subtitle">
                        {event.title}
                    </p>
                </div>

                {error && (
                    <div className="error feedback-message">
                        {error}
                    </div>
                )}

                <div className="feedback-stats">
                    <div className="card feedback-stat">
                        <span>Середня оцінка</span>

                        <strong>
                            {averageRating}
                            {averageRating !== "—" && " / 5"}
                        </strong>
                    </div>

                    <div className="card feedback-stat">
                        <span>Кількість відгуків</span>

                        <strong>
                            {feedback.length}
                        </strong>
                    </div>
                </div>

                {feedback.length === 0 ? (
                    <div className="card empty-state">
                        <h2>
                            Відгуків поки немає
                        </h2>

                        <p>
                            Відгуки учасників з'являться
                            після завершення заходу.
                        </p>
                    </div>
                ) : (
                    <div className="feedback-list">
                        {feedback.map((item) => (
                            <article
                                className="card feedback-item"
                                key={item.id}
                            >
                                <div className="feedback-item-header">
                                    <div>
                                        <h2>
                                            {item.user_name}
                                        </h2>

                                        <div className="feedback-date">
                                            {new Date(
                                                item.created_at
                                            ).toLocaleString(
                                                "uk-UA"
                                            )}
                                        </div>
                                    </div>

                                    <div className="feedback-rating">
                                        {"★".repeat(
                                            item.rating
                                        )}
                                        {"☆".repeat(
                                            5 - item.rating
                                        )}
                                    </div>
                                </div>

                                {item.comment ? (
                                    <p className="feedback-comment">
                                        {item.comment}
                                    </p>
                                ) : (
                                    <p className="feedback-no-comment">
                                        Користувач не залишив
                                        коментаря.
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default FeedbackPage;