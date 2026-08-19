import Header from "@/components/layout/Header";
import { Outlet } from "react-router";

export default function PublicLayout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}