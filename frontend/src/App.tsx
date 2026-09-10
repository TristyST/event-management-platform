import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Header from "./components/Header";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import MyEventsPage from "./pages/MyEventsPage";

import DashboardPage from "./pages/organizer/DashboardPage";
import CreateEventPage from "./pages/organizer/CreateEventPage";
import EditEventPage from "./pages/organizer/EditEventPage";
import ParticipantsPage from "./pages/organizer/ParticipantsPage";
import FeedbackPage from "./pages/organizer/FeedbackPage";

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Header />

                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/events" replace />}
                    />

                    {/* Загальні сторінки */}
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />

                    {/* Учасник */}
                    <Route
                        path="/events"
                        element={<EventsPage />}
                    />

                    <Route
                        path="/events/:id"
                        element={<EventDetailsPage />}
                    />

                    <Route
                        path="/my-events"
                        element={<MyEventsPage />}
                    />

                    {/* Організатор */}
                    <Route
                        path="/organizer"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/organizer/events/create"
                        element={<CreateEventPage />}
                    />

                    <Route
                        path="/organizer/events/:id/edit"
                        element={<EditEventPage />}
                    />

                    <Route
                        path="/organizer/events/:id/participants"
                        element={<ParticipantsPage />}
                    />

                    <Route
                        path="/organizer/events/:id/feedback"
                        element={<FeedbackPage />}
                    />

                    {/* Невідомий маршрут */}
                    <Route
                        path="*"
                        element={<Navigate to="/events" replace />}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;