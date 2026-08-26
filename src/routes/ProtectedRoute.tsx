import { useAuth } from "@/auth/AuthProvider";
import { PageLoader } from "@/components/common/PageLoader";
import { Navigate } from "react-router";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        user,
        loading,
        initialized,
    } = useAuth();

    if (!initialized || loading) {
        return <PageLoader />;
    }

    if (!user) {
        return (
            <Navigate
                to="/sign-in"
                replace
            />
        );
    }

    return children;
}