import React, { useState, useEffect } from 'react';

// הגדרות קבועות
const LAT = 32.08; // תל אביב
const LON = 34.78; // תל אביב
const TEMP_THRESHOLD_C = 35;

/**
 * קומפוננטת React שמציגה נתוני מזג אוויר עדכניים.
 * מציגה דוגמה לאינטגרציה ישירה של API ב-Frontend.
 */
const WeatherDisplay = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                const data = await response.json();
                
                if (data.current_weather) {
                    setWeather(data.current_weather);
                } else {
                    throw new Error("Missing weather data in response.");
                }

            } catch (err) {
                setError(`Failed to fetch weather data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        // פונקציה לטעינה ראשונית וטעינה חוזרת כל 15 דקות (כמו ה-Scheduler ב-Make)
        fetchWeather();
        const intervalId = setInterval(fetchWeather, 15 * 60 * 1000); 

        return () => clearInterval(intervalId);
    }, []);

    const getStatusClass = (temp) => {
        if (temp > TEMP_THRESHOLD_C) {
            return "bg-red-600 text-white";
        }
        return "bg-green-500 text-white";
    };

    if (loading) return <div className="text-center p-6">טוען נתוני מזג אוויר...</div>;
    if (error) return <div className="text-center p-6 text-red-700 font-bold">שגיאה: {error}</div>;

    const { temperature, windspeed, time } = weather;
    const anomalyStatus = temperature > TEMP_THRESHOLD_C ? "חריגה (מעל 35°C)" : "תקין";
    const statusClass = getStatusClass(temperature);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full border border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
                    ניטור API: דוגמת קוד React
                </h1>

                <p className="text-sm text-gray-500 mb-4">
                    מציג נתונים בזמן אמת ע"י קריאת API ישירה ל-Open-Meteo.
                    <br />
                    **(להשוואה לפתרון האוטומציה של Make)**
                </p>

                <div className="space-y-4">
                    <div className="p-3 rounded-lg flex justify-between items-center text-lg font-semibold border">
                        <span>מיקום (LAT, LON):</span>
                        <span className="text-blue-600">{LAT}, {LON}</span>
                    </div>

                    <div className="p-4 rounded-xl border-2 shadow-sm">
                        <p className="text-sm text-gray-500">טמפרטורה (C°):</p>
                        <span className="text-4xl font-bold text-gray-900">{temperature}°</span>
                        <p className="text-sm text-gray-500 mt-2">Windspeed: {windspeed} km/h</p>
                    </div>

                    <div className={`p-4 rounded-xl font-bold flex justify-between items-center transition duration-300 ${statusClass}`}>
                        <span>סטטוס ניטור:</span>
                        <span>{anomalyStatus}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t mt-4">
                        זמן עדכון אחרון: {new Date(time).toLocaleString('he-IL')}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">השוואה ל-Make</h2>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>בקוד: אנחנו מטפלים ב-HTTP, ב-JSON Parsing, ובבדיקת הסטטוס **בתוך הקוד**.</li>
                        <li>ב-Make: כל הלוגיקה (HTTP, Parse JSON, Router/Filter) מטופלת **בממשק גרפי** ואינה דורשת פריסה מחדש (Deployment).</li>
                        <li>כשלים (כמו חריגה) בקוד דורשים **כתיבת לוגיקה** לשליחת התראות (Slack/GitHub) ידנית.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <React.Fragment>
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="App">
                <WeatherDisplay />
            </div>
        </React.Fragment>
    );
};

export default App;
