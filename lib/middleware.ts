import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, generateTokens } from './auth';

export function withAuth(handler: (req: NextRequest, params?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, params?: any) => {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = parseCookies(cookieHeader);
      const accessToken = cookies['accessToken'];
      const refreshToken = cookies['refreshToken'];

      let payload = accessToken ? verifyAccessToken(accessToken) : null;
      let newTokens: { accessToken: string; refreshToken: string } | null = null;

      // If access token is expired/missing, try refreshing via refresh token
      if (!payload && refreshToken) {
        const refreshPayload = verifyRefreshToken(refreshToken);
        if (refreshPayload) {
          // Strip jwt-specific fields before re-signing
          const { userId, email, role } = refreshPayload;
          newTokens = generateTokens({ userId, email, role });
          payload = verifyAccessToken(newTokens.accessToken);
        }
      }

      if (!payload) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Attach user to request
      (req as any).user = payload;

      const response = await handler(req, params);

      // If we generated new tokens, set them as cookies on the response
      if (newTokens) {
        response.cookies.set('accessToken', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/',
        });
        response.cookies.set('refreshToken', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }

      return response;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}

export function withRole(...allowedRoles: string[]) {
  return (handler: (req: NextRequest, params?: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, params?: any) => {
      try {
        const cookieHeader = req.headers.get('cookie') || '';
        const cookies = parseCookies(cookieHeader);
        const accessToken = cookies['accessToken'];
        const refreshToken = cookies['refreshToken'];

        let payload = accessToken ? verifyAccessToken(accessToken) : null;
        let newTokens: { accessToken: string; refreshToken: string } | null = null;

        // If access token is expired/missing, try refreshing via refresh token
        if (!payload && refreshToken) {
          const refreshPayload = verifyRefreshToken(refreshToken);
          if (refreshPayload) {
            const { userId, email, role } = refreshPayload;
            newTokens = generateTokens({ userId, email, role });
            payload = verifyAccessToken(newTokens.accessToken);
          }
        }

        if (!payload) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        if (!allowedRoles.includes(payload.role)) {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }

        (req as any).user = payload;
        const response = await handler(req, params);

        // If we generated new tokens, set them as cookies on the response
        if (newTokens) {
          response.cookies.set('accessToken', newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
            path: '/',
          });
          response.cookies.set('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });
        }

        return response;
      } catch (error) {
        console.error('Role middleware error:', error);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    };
  };
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
