from __future__ import annotations

import hashlib
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

from app.data.schemas import NewsItem
from app.data.sources import NewsSource


class RSSNewsSource(NewsSource):
    """Minimal RSS adapter. Feed URLs are configured by the caller; no site scraping."""

    name = "rss"

    def __init__(self, feeds: dict[str, str]):
        self.feeds = feeds

    def latest(self, symbols: list[str] | None = None) -> list[NewsItem]:
        wanted = {s.upper() for s in symbols or []}
        items: list[NewsItem] = []
        for source, url in self.feeds.items():
            request = urllib.request.Request(url, headers={"User-Agent": "ORION/0.2 RSS reader"})
            with urllib.request.urlopen(request, timeout=15) as response:
                root = ET.fromstring(response.read())
            for node in root.findall(".//item"):
                title = (node.findtext("title") or "").strip()
                link = (node.findtext("link") or "").strip()
                published = node.findtext("pubDate")
                description = re.sub("<[^>]+>", " ", node.findtext("description") or "").strip()
                try:
                    timestamp = datetime.strptime(published, "%a, %d %b %Y %H:%M:%S %z") if published else datetime.now(timezone.utc)
                except ValueError:
                    timestamp = datetime.now(timezone.utc)
                symbols_found = tuple(s for s in wanted if re.search(rf"(?<![A-Z]){re.escape(s)}(?![A-Z])", title.upper()))
                digest = hashlib.sha256(f"{source}|{title}|{link}".encode()).hexdigest()[:24]
                item = NewsItem(digest, title, link, timestamp, source, symbols_found, description)
                if not wanted or symbols_found:
                    items.append(item)
        return items
