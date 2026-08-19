export default function handler(request, response) {
  const { token } = request.query;
  const cleanToken = Array.isArray(token) ? token[0] : token;

  response.writeHead(302, {
    Location: `/invite/${encodeURIComponent(cleanToken ?? '')}`,
  });
  response.end();
}
