export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
            },
            boxShadow: {
                soft: "0 18px 55px rgba(15, 23, 42, 0.11)",
                panel: "0 12px 35px rgba(36, 42, 92, 0.10)"
            }
        }
    },
    plugins: []
};
