import time
from fastapi import HTTPException, Request, status
from collections import defaultdict
import threading

class RateLimiter:
    def __init__(self, requests_limit: int = 10, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        with self.lock:
            # Filter out timestamps outside the window
            self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window_seconds]
            if len(self.requests[client_ip]) >= self.requests_limit:
                return False
            self.requests[client_ip].append(now)
            return True

# Create a rate limiter instance (e.g. 60 requests per minute)
rate_limiter = RateLimiter(requests_limit=10, window_seconds=60)

async def rate_limit_dependency(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Too many requests from this IP. Please try again in a minute."
        )
