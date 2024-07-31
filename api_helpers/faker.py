# Generate fake data returned from the Focusmate API for demo and testing
# We're not using the Faker lib due to Vercel serverless function size limit

import random
import uuid
from datetime import datetime, timedelta, timezone

NUM_SESSIONS = 1500
USER_ID = "5edcf2e5-539c-4250-966a-468a7ddfa38d"  # example from FM API docs
DURATION_OPTIONS = [1500000, 3000000, 4500000]
HOURS = list(range(24))
HOUR_WEIGHTS = [1 if 9 <= hour <= 18 else 0.05 for hour in HOURS]
MINUTE_OPTIONS = [0, 15, 30, 45]
START_YEAR = datetime.now().year - 2
COMPLETED_WEIGHTS = [1, 0.05]


def random_date(start, end):
    """Generate a random datetime between `start` and `end`."""
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )


def generate_fake_sessions(num_sessions: int = NUM_SESSIONS) -> list:
    sessions = []
    datetime_start = datetime(START_YEAR, 1, 1, tzinfo=timezone.utc)
    datetime_end = datetime.now(timezone.utc)
    for _ in range(num_sessions):
        chosen_hour = random.choices(HOURS, weights=HOUR_WEIGHTS, k=1)[0]
        start_time = random_date(datetime_start, datetime_end)
        start_time = start_time.replace(hour=chosen_hour, minute=random.choice(
            MINUTE_OPTIONS), second=0, microsecond=0)

        requested_at = random_date(
            start_time - timedelta(days=1),
            start_time
        )

        completed = random.choices(
            [True, False], weights=COMPLETED_WEIGHTS, k=1)[0]
        joined_at = None
        if completed:
            # Users can only join a session within 10m before or 1m after start
            join_margin = timedelta(minutes=random.randint(-10, 1))
            joined_at = start_time + join_margin
            if joined_at < requested_at:
                joined_at = requested_at  # ensure joined_at >= requested_at

        duration = random.choice(DURATION_OPTIONS)

        session = {
            "sessionId": str(uuid.uuid4()),
            "duration": str(duration),
            "startTime": start_time.isoformat(),
            "users": [
                {
                    "userId": USER_ID,
                    "sessionTitle": "",
                    "requestedAt": requested_at.isoformat(),
                    "joinedAt": joined_at.isoformat() if joined_at else None,
                    "completed": completed
                }
            ]
        }
        if completed:
            session["users"].append({
                "userId": str(uuid.uuid4())
            })

        sessions.append(session)

    return sessions


fake_profile = {
    "userId": USER_ID,
    "name": "John Doe",
    "totalSessionCount": NUM_SESSIONS,
    "timeZone": "Etc/UTC",  # for simplicity
}
