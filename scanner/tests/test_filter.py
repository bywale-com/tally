"""Unit tests for the loose regex filter (handoff §3 + §8 confession check)."""

from tally_scanner.filter import filter_posting, normalize_text


def test_normalize_hyphen_variants():
    assert normalize_text("self-sourced") == normalize_text("self sourced")
    assert normalize_text("self–sourced") == normalize_text("self sourced")  # en-dash


def test_confession_self_sourced():
    body = "You will be 100% self-sourced. No inbound leads."
    r = filter_posting("Account Executive", body)
    assert r.passed
    assert r.confession_hit is True
    assert r.confession_quote is not None
    assert "self" in r.confession_quote.lower()


def test_role_founding_ae():
    r = filter_posting("Founding AE", "Build our sales motion from the ground up.")
    assert r.passed
    assert r.matched_role == "founding ae"


def test_head_of_sales_needs_stage():
    r = filter_posting("Head of Sales", "Join our enterprise team.")
    assert not r.passed
    r2 = filter_posting("Head of Sales", "Seed-stage startup looking for Head of Sales.")
    assert r2.passed


def test_player_coach_needs_sales():
    r = filter_posting("Player-Coach", "Lead our engineering pod.")
    assert not r.passed
    r2 = filter_posting("Player-Coach", "Player-coach sales hire reporting to CEO.")
    assert r2.passed


def test_superpanel_smoke_text():
    """Reference case language from handoff §8 should pass with confession."""
    title = "Founding Account Executive"
    body = (
        "This is our first sales hire. 100% self-sourced, no SDR, no inbound. "
        "Minimum contract $36k/year. Report to the CEO."
    )
    r = filter_posting(title, body)
    assert r.passed
    assert r.confession_hit
