"""Competition ranking for the streak leaderboard.

Note: nothing imports this module today. The tests pin the ranking rules so
that whoever wires it up inherits a defined contract rather than guessing.
"""

from io import StringIO

from api_utils.leaderboard import generate_rank


def csv(rows):
    body = "user_id,daily_streak\n" + "\n".join(
        f"{user},{streak}" for user, streak in rows)
    return StringIO(body)


class TestGenerateRank:
    def test_orders_by_streak_descending(self):
        result = generate_rank(csv([("a", 3), ("b", 10), ("c", 7)]))
        assert [row["user_id"] for row in result] == ["b", "c", "a"]

    def test_assigns_sequential_ranks(self):
        result = generate_rank(csv([("a", 10), ("b", 7), ("c", 3)]))
        assert [row["rank"] for row in result] == [1, 2, 3]

    def test_ties_share_a_rank(self):
        result = generate_rank(csv([("a", 10), ("b", 10), ("c", 3)]))
        assert [row["rank"] for row in result] == [1, 1, 3]

    def test_a_tie_consumes_the_ranks_it_spans(self):
        # Standard competition ranking: three at the top means the next entry
        # is fourth, not second
        result = generate_rank(csv([
            ("a", 10), ("b", 10), ("c", 10), ("d", 5)]))
        assert [row["rank"] for row in result] == [1, 1, 1, 4]

    def test_a_tie_further_down_the_table(self):
        result = generate_rank(csv([
            ("a", 10), ("b", 7), ("c", 7), ("d", 1)]))
        assert [row["rank"] for row in result] == [1, 2, 2, 4]

    def test_everyone_tied(self):
        result = generate_rank(csv([("a", 4), ("b", 4), ("c", 4)]))
        assert [row["rank"] for row in result] == [1, 1, 1]

    def test_a_single_entry(self):
        assert generate_rank(csv([("a", 4)])) == [
            {"user_id": "a", "daily_streak": 4, "rank": 1}]

    def test_zero_streaks_still_rank(self):
        result = generate_rank(csv([("a", 0), ("b", 0)]))
        assert [row["rank"] for row in result] == [1, 1]

    def test_ignores_columns_it_does_not_need(self):
        body = StringIO(
            "user_id,daily_streak,email\na,5,a@example.test\nb,9,b@example.test")
        result = generate_rank(body)
        assert [row["user_id"] for row in result] == ["b", "a"]
        assert "email" not in result[0]
