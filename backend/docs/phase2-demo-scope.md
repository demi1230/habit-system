Goal: demo-ready backend flow
In scope: register/login/JWT/ownership/Swagger
Out of scope: reminder, notification, reward, adaptive logic
Demo flow: register → login → create habit → log completion → get progress summary

## Status: IMPLEMENTED

### What was built
1. `POST /auth/register` — creates user with bcrypt-hashed password (cost 12)
2. `POST /auth/login` — validates credentials, returns JWT (7-day expiry)
3. `JwtStrategy` — validates Bearer token via `passport-jwt`
4. `JwtAuthGuard` — extends `AuthGuard('jwt')`, enforces `:userId` param ownership
5. `@UseGuards(JwtAuthGuard)` on HabitsController, ProgressController, AnalyticsController
6. Swagger UI at `GET /api` — full OpenAPI docs with Bearer auth support

### Files created
- src/auth/auth.controller.ts
- src/auth/jwt.strategy.ts
- src/auth/jwt-auth.guard.ts
- src/auth/jwt-payload.interface.ts
- src/auth/dto/register.dto.ts
- src/auth/dto/login.dto.ts
- .env.example

### Files modified
- src/auth/auth.service.ts — added register(), login(), bcrypt, JwtService
- src/auth/auth.module.ts — added PassportModule, JwtModule, controller, strategy
- src/habits/habits.controller.ts — added JwtAuthGuard + Swagger tags
- src/progress/progress.controller.ts — added JwtAuthGuard + Swagger tags
- src/analytics/analytics.controller.ts — added JwtAuthGuard + Swagger tags
- src/main.ts — added SwaggerModule setup