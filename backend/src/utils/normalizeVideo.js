/**
 * Normalize any YouTube URL format to canonical format
 * Handles: youtu.be, watch?v, embed, playlist URLs, with query parameters
 * Returns: { videoId: string, src: string } where src is canonical format
 */
function normalizeVideoURL(raw) {
  if (!raw) return { videoId: "", src: "" };
  const s = String(raw).trim();
  const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|watch\?v=)?([A-Za-z0-9_-]{11})/);
  const id = m ? m[1] : "";
  const src = id ? `https://www.youtube.com/watch?v=${id}` : s;
  return { videoId: id, src };
}

module.exports = { normalizeVideoURL };

