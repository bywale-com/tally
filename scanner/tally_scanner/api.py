"""HTTP entrypoint for n8n: POST /run triggers the daily pipeline."""

from __future__ import annotations

import logging

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from tally_scanner.pipeline import run_daily

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(title="Tally Scanner", version="0.1.0")


class RunRequest(BaseModel):
    discover: bool = True
    score: bool = True
    write_notion: bool = True


class RunResponse(BaseModel):
    ok: bool = True
    result: dict = Field(default_factory=dict)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/run", response_model=RunResponse)
def run(
    body: RunRequest | None = None,
    x_scanner_token: str | None = Header(default=None),
) -> RunResponse:
    """
    Trigger one daily pipeline run.
    Optional header X-Scanner-Token if SCANNER_API_TOKEN is set in env (future).
    """
    req = body or RunRequest()
    try:
        result = run_daily(
            discover=req.discover,
            score=req.score,
            write_notion=req.write_notion,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return RunResponse(ok=True, result=result)
