from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://tally:tally@localhost:5432/tally_scanner"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    openai_api_key: str = ""
    openai_filter_model: str = "gpt-4o-mini"
    notion_token: str = ""
    notion_parent_page_id: str = "37272d09-0a44-80ec-a852-000b049519b1"
    notion_database_id: str = ""
    searxng_url: str = "http://localhost:8080"
    scanner_dry_run: bool = False
    # Max postings per LLM batch call (chunk if survivors exceed this)
    scorer_batch_size: int = 25
    # Max postings per AI filter batch call
    filter_batch_size: int = 30
    http_timeout: float = 30.0
    user_agent: str = "TallyScanner/0.1 (+https://omcoda.com; research)"


@lru_cache
def get_settings() -> Settings:
    return Settings()
