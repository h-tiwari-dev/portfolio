import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Only log for keystatic API routes
  if (!url.pathname.startsWith('/api/keystatic')) {
    return next();
  }

  const route = url.pathname.replace('/api/keystatic/', '');
  const env = context.locals?.runtime?.env;

  console.log(`[keystatic-debug] === ${context.request.method} ${route} ===`);

  // Log env var availability
  console.log(`[keystatic-debug] env object exists: ${!!env}`);
  if (env) {
    console.log(`[keystatic-debug] KEYSTATIC_GITHUB_CLIENT_ID: ${env.KEYSTATIC_GITHUB_CLIENT_ID ? `set (${env.KEYSTATIC_GITHUB_CLIENT_ID.length} chars)` : 'MISSING'}`);
    console.log(`[keystatic-debug] KEYSTATIC_GITHUB_CLIENT_SECRET: ${env.KEYSTATIC_GITHUB_CLIENT_SECRET ? `set (${env.KEYSTATIC_GITHUB_CLIENT_SECRET.length} chars)` : 'MISSING'}`);
    console.log(`[keystatic-debug] KEYSTATIC_SECRET: ${env.KEYSTATIC_SECRET ? `set (${env.KEYSTATIC_SECRET.length} chars)` : 'MISSING'}`);
  }

  // Log cookies
  const cookieHeader = context.request.headers.get('cookie') || '';
  const hasAccessToken = cookieHeader.includes('keystatic-gh-access-token');
  const hasRefreshToken = cookieHeader.includes('keystatic-gh-refresh-token');
  console.log(`[keystatic-debug] cookies: access-token=${hasAccessToken}, refresh-token=${hasRefreshToken}`);

  // For oauth/callback — intercept and log the GitHub token exchange
  if (route === 'github/oauth/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log(`[keystatic-debug] callback code: ${code ? `present (${code.length} chars)` : 'MISSING'}`);
    console.log(`[keystatic-debug] callback error: ${error ?? 'none'}`);
    console.log(`[keystatic-debug] callback error_description: ${errorDescription ?? 'none'}`);

    // Make the same token exchange call to see what GitHub returns
    if (code && env) {
      try {
        const tokenUrl = new URL('https://github.com/login/oauth/access_token');
        tokenUrl.searchParams.set('client_id', env.KEYSTATIC_GITHUB_CLIENT_ID);
        tokenUrl.searchParams.set('client_secret', env.KEYSTATIC_GITHUB_CLIENT_SECRET);
        tokenUrl.searchParams.set('code', code);

        const tokenRes = await fetch(tokenUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        });

        const tokenBody = await tokenRes.text();
        console.log(`[keystatic-debug] GitHub token exchange status: ${tokenRes.status}`);
        console.log(`[keystatic-debug] GitHub token exchange response: ${tokenBody}`);
      } catch (err) {
        console.log(`[keystatic-debug] GitHub token exchange fetch error: ${err}`);
      }
    }
  }

  if (route === 'github/refresh-token' && !hasRefreshToken) {
    console.log(`[keystatic-debug] CAUSE: No refresh-token cookie present — user has not completed OAuth login yet`);
  }

  // Call the actual handler
  const response = await next();

  console.log(`[keystatic-debug] response status: ${response.status}`);

  // Log the response body on failure
  if (response.status === 401 || response.status === 400) {
    try {
      const body = await response.clone().text();
      console.log(`[keystatic-debug] response body: ${body}`);
    } catch {}
  }

  return response;
});
