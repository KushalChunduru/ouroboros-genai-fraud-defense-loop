"""Process-local in-memory store. Fine for a hackathon prototype demo; a
production deployment would back this with a real datastore, unrelated to
the ML/agent logic this codebase demonstrates."""
from app.defend.detector import FusedDetector


class Store:
    """Process-local, no auth/session isolation -- a known limitation, not a
    hidden one (see docs/DESIGN.md and README). detectors is keyed by
    batch_id rather than a single "last" pointer so at least concurrent
    detect() calls on DIFFERENT batches in the same process don't silently
    overwrite each other's trained model; true multi-user isolation would
    still need real session tokens, which this demo doesn't have."""

    def __init__(self):
        self.batches: dict[str, list[dict]] = {}
        self.detectors: dict[str, FusedDetector] = {}
        self.last_batch_id: str | None = None
        # Cached detect() results keyed by batch_id, so a permalink report
        # page can fetch a specific run's results without re-training.
        self.reports: dict[str, dict] = {}

    @property
    def last_detector(self) -> FusedDetector | None:
        return self.detectors.get(self.last_batch_id) if self.last_batch_id else None

    def set_detector(self, batch_id: str | None, detector: FusedDetector) -> None:
        key = batch_id or "__unbatched__"
        self.detectors[key] = detector
        self.last_batch_id = key


store = Store()
