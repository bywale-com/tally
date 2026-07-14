from tally_scanner.models import dedup_hash


def test_dedup_ignores_source():
    a = dedup_hash("Acme", "Founding AE")
    b = dedup_hash("acme", "founding ae")
    assert a == b


def test_dedup_different_titles():
    assert dedup_hash("Acme", "Founding AE") != dedup_hash("Acme", "SDR")
