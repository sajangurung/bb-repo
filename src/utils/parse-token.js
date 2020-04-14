export default function parseToken(hash) {
  const match = RegExp('access_token=([^&]*)').exec(hash);
  if (match) {
    const token = decodeURIComponent(match[1].replace(/\+/g, ' '));
    return token;
  }

  return undefined;
}
