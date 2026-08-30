"""Process-local in-memory store. Fine for a hackathon prototype demo; a
production deployment would back this with a real datastore, unrelated to
the ML/agent logic this codebase demonstrates."""
from app.defend.detector import FusedDetector


class Store:
    def __init__(self):
        self.batches: dict[str, list[dict]] = {}
        self.last_detector: FusedDetector | None = None
        self.last_train_transactions: list[dict] | None = None
        # Cached detect() results keyed by batch_id, so a permalink report
        # page can fetch a specific run's results without re-training.
        self.reports: dict[str, dict] = {}


store = Store()
