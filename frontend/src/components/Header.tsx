import { Link, useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    let user: {
        name: string;
        role: "participant" | "organizer";
    } | null = null;

    try {
        user = userData ? JSON.parse(userData) : null;
    } catch {
        user = null;
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <header className="header">
            <div className="container header-inner">
                <Link to="/events" className="logo">
                    EventHub
                </Link>

                <nav className="nav">
                    <Link to="/events">
                        Заходи
                    </Link>

                    {user?.role === "participant" && (
                        <Link to="/my-events">
                            Мої заходи
                        </Link>
                    )}

                    {user?.role === "organizer" && (
                        <Link to="/organizer">
                            Організатор
                        </Link>
                    )}

                    {!token ? (
                        <>
                            <Link to="/login">
                                Увійти
                            </Link>

                            <Link to="/register">
                                Реєстрація
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="header-user">
                                {user?.name}
                            </span>

                            <button
                                className="header-logout"
                                onClick={handleLogout}
                            >
                                Вийти
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;