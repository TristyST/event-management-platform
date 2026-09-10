import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../../services/api";

interface Event {
    id: number;
    title: string;
    short_description: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    capacity: number;
    status: "draft" | "published" | "completed";
}

function EditEventPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);

    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] =
        useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setError("");

                const data = await apiRequest(
                    `/events/${id}`
                );

                const loadedEvent: Event = data.event;

                setEvent(loadedEvent);

                setTitle(loadedEvent.title);
                setShortDescription(
                    loadedEvent.short_description
                );
                setDescription(loadedEvent.description);
                setEventDate(loadedEvent.event_date);
                setEventTime(
                    loadedEvent.event_time.slice(0, 5)
                );
                setLocation(loadedEvent.location);
                setCapacity(
                    String(loadedEvent.capacity)
                );
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

    const handleSubmit = async (
        formEvent: FormEvent
    ) => {
        formEvent.preventDefault();

        try {
            setError("");
            setSaving(true);

            await apiRequest(`/events/${id}`, {
                method: "PUT",
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
                    : "Не вдалося оновити захід"
            );
        } finally {
            setSaving(false);
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

    if (event.status === "completed") {
        return (
            <main className="page">
                <div className="container">
                    <div className="card empty-state">
                        <h2>
                            Захід уже завершено
                        </h2>

                        <p>
                            Завершені заходи не можна
                            редагувати.
                        </p>

                        <Link
                            className="btn btn-primary"
                            to="/organizer"
                        >
                            До панелі організатора
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

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
                        Редагування заходу
                    </h1>

                    <p className="page-subtitle">
                        Оновіть інформацію про захід.
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
                                disabled={saving}
                            >
                                {saving
                                    ? "Збереження..."
                                    : "Зберегти зміни"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default EditEventPage;