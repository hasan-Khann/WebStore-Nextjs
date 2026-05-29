// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';
// import { redis } from '@/lib/rediscache';

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;
//   const ip = request.ip ?? '127.0.0.1';

//   const limit = 20;
//   const window = 60;
//   const currentUsage = await redis.incr(`rate_limit:${ip}`);
  
//   if (currentUsage === 1) await redis.expire(`rate_limit:${ip}`, window);
//   if (currentUsage > limit) {
//     return NextResponse.json({ msg: "Too many requests" }, { status: 429 });
//   }

//   // --- 2. Admin Route Protection ---
//   if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
//     const token = request.cookies.get('accessToken')?.value;
//     if (!token) return NextResponse.redirect(new URL('/login', request.url));

//     try {
//       const { payload } = await jwtVerify(
//         token, 
//         new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
//       );

//       if (payload.role !== 'admin') {
//         return NextResponse.json({ msg: "Forbidden: Admins only" }, { status: 403 });
//       }
//     } catch (err) {
//       return NextResponse.redirect(new URL('/login', request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/api/:path*', '/admin/:path*'],
// };
