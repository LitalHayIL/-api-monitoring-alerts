import requests
import sys

# הגדרות ברירת מחדל (כמו בתרחיש Make)
LAT = 32.08  # תל אביב
LON = 34.78  # תל אביב
TEMP_THRESHOLD_C = 35

def check_weather_anomaly():
    """
    מבצע קריאת API למזג אוויר ובודק האם יש חריגה בטמפרטורה.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current_weather=true"
    
    print(f"Executing API check for location: ({LAT}, {LON})...")
    
    try:
        response = requests.get(url, timeout=10)
        
        # בדיקת סטטוס HTTP
        if response.status_code != 200:
            print(f"ANOMALY DETECTED: HTTP Status Code is {response.status_code}. Expected 200.")
            # בתרחיש אמיתי, כאן היינו יוצרים Issue ב-GitHub
            return
            
        data = response.json()
        
        # ודא שמבנה הנתונים תקין
        if 'current_weather' not in data:
            print("ANOMALY DETECTED: 'current_weather' data is missing in the response.")
            return

        current_temp = data['current_weather']['temperature']
        
        print(f"Current Temperature: {current_temp}°C")
        
        # בדיקת חריגת טמפרטורה
        if current_temp > TEMP_THRESHOLD_C:
            print(f"\n--- API MONITOR ALERT (Python) ---")
            print(f"CRITICAL: Temperature {current_temp}°C exceeds threshold of {TEMP_THRESHOLD_C}°C.")
            print("Action required: Check API and system logs.")
            # ב-Make, כאן היינו שולחים הודעת Slack ויוצרים Issue
        else:
            print("Status OK: Temperature is within acceptable limits.")

    except requests.exceptions.RequestException as e:
        print(f"ANOMALY DETECTED: Network or API request failed. Error: {e}")
        # כאן היינו מפעילים Issue/התראה
    except Exception as e:
        print(f"ANOMALY DETECTED: An unexpected error occurred: {e}")

if __name__ == "__main__":
    # נדרשת התקנת ספריית requests: pip install requests
    check_weather_anomaly()
