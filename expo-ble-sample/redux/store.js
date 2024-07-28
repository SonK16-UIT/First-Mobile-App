import { configureStore } from "@reduxjs/toolkit";

import hub from "./slices/hub";
export const store = configureStore({
    reducer: {
        hub
    }
})