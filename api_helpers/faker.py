from faker import Faker
import random
from datetime import datetime, timedelta, timezone

fake = Faker()
Faker.seed(0)

NUM_SESSIONS = 2000
USER_ID = "5edcf2e5-539c-4250-966a-468a7ddfa38d"  # example from FM API docs
DURATION_OPTIONS = [1500000, 3000000, 4500000]
HOURS = list(range(24))
HOUR_WEIGHTS = [1 if 9 <= hour <= 18 else 0.1 for hour in HOURS]
MINUTE_OPTIONS = [0, 15, 30, 45]
START_YEAR = datetime.now().year - 2
COMPLETED_WEIGHTS = [0.95, 0.05]


def generate_fake_sessions(num_sessions: int = NUM_SESSIONS) -> list:
    '''Generate fake sessions in a format that mimics data returned from the
    Focusmate API for demo and testing purposes'''
    sessions = []
    datetime_start = datetime(START_YEAR, 1, 1, tzinfo=timezone.utc)
    datetime_end = datetime.now(timezone.utc)
    for _ in range(num_sessions):
        chosen_hour = random.choices(HOURS, weights=HOUR_WEIGHTS, k=1)[0]
        start_time = fake.date_time_between_dates(
            datetime_start, datetime_end, tzinfo=timezone.utc)
        start_time = start_time.replace(hour=chosen_hour, minute=random.choice(
            MINUTE_OPTIONS), second=0, microsecond=0)

        requested_at = fake.date_time_between_dates(
            datetime_start=start_time - timedelta(days=1),
            datetime_end=start_time, tzinfo=timezone.utc)

        completed = random.choices([True, False], weights=COMPLETED_WEIGHTS)
        joined_at = None
        if completed:
            # Users can only join a session within 10m before or 1m after start
            join_margin = timedelta(minutes=random.randint(-10, 1))
            joined_at = start_time + join_margin
            if joined_at < requested_at:
                joined_at = requested_at  # ensure joined_at >= requested_at

        duration = random.choice(DURATION_OPTIONS)

        session = {
            "sessionId": fake.uuid4(),
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
                "userId": fake.uuid4()
            })

        sessions.append(session)

    return sessions
