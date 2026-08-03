import { createBrowserRouter } from "react-router-dom";
import PhoneEntry from "./pages/PhoneEntry";
import OTPConfirmation from "./pages/OTPConfirmation";

export const router = createBrowserRouter([

    { path: "/auth/phone", element: <PhoneEntry /> },
    { path: "/auth/otp", element: <OTPConfirmation /> }


])