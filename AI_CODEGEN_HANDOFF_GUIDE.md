# AI_CODEGEN_HANDOFF_GUIDE.md

## 1. What the AI receives

- All JSON contracts in `contracts/`
- Event envelope + event definitions in `events/`
- Repo structure (conceptual)
- Implementation checklist + flow docs

## 2. What the AI should generate (in order)

1. TypeScript types from `contracts/`
2. OpenAPI from types
3. Backend services from OpenAPI
4. Event producers/consumers from `events/`
5. Client SDK from OpenAPI
6. React Query hooks from SDK
7. Components from JSON shapes
8. Pages from hooks + components
9. CI/CD from service map
10. Infra from `infra/` skeleton

## 3. Rules for the AI

- **Never** change JSON contracts unless explicitly instructed
- Treat `contracts/` as **source of truth**
- Keep event envelope shape consistent
- Keep component props = JSON shapes (no mutation)
