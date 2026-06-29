# Admin Panel Enhancement Plan

## User Request
Implement the top 4 recommended admin panel features:
1. Dashboard Overview Page
2. Bulk Actions
3. Advanced Search & Filters
4. Submission Notes

## Repo Research Conclusion

### Existing Admin Architecture
- **Frontend admin page**: `frontend/src/app/admin/page.tsx` — single large client component with tabbed sections for Submissions, Users, Videos, Sessions.
- **Admin sidebar**: `frontend/src/components/layout/admin-sidebar.tsx` — has 4 tabs: Submissions, Users, Videos, Sessions. No Overview tab exists.
- **Backend admin routes**: `backend/src/routes/admin.ts` — Express router with endpoints for:
  - Auth (login/logout/verify/sessions)
  - Submissions: GET list, DELETE single, PATCH status, PATCH mark-read, GET by service
  - Users: CRUD + reset password
  - Videos: CRUD + reorder
- **Prisma schema**: `backend/prisma/schema.prisma` has:
  - `User` model
  - `Submission` model (with status, read, statusHistory, attachments)
  - `Attachment` model
  - `Video` model
  - **No `Note` model** — needs to be added.
- **Admin auth**: JWT via httpOnly cookie (`admin_token`), `authenticateToken` middleware on all protected routes.

## Files and Modules to Edit

### Backend
- `backend/prisma/schema.prisma` — add `SubmissionNote` model and relation to `Submission`.
- `backend/src/routes/admin.ts` — add endpoints:
  - `GET /admin/overview` (dashboard metrics)
  - `PATCH /admin/submissions/bulk-read` (bulk mark read/unread)
  - `DELETE /admin/submissions/bulk` (bulk delete)
  - `PATCH /admin/submissions/bulk-status` (bulk status update)
  - `GET /admin/submissions` extended with query filters (date range, status, type)
  - `GET /admin/submissions/:id/notes`
  - `POST /admin/submissions/:id/notes`
  - `DELETE /admin/submissions/:id/notes/:noteId`

### Frontend
- `frontend/src/components/layout/admin-sidebar.tsx` — add "Overview" tab at the top.
- `frontend/src/app/admin/page.tsx` — major refactor/extend:
  - Add `overview` activeTab state and render new dashboard section.
  - Add bulk selection state and bulk action bar.
  - Add advanced filter state (date range, multi-status, submission type) and wire to backend query.
  - Add saved filter presets (localStorage).
  - Add notes UI inside submission detail modal/expanded row.
- **New components**:
  - `frontend/src/components/admin/overview-tab.tsx` — dashboard cards + recent submissions + quick actions.
  - `frontend/src/components/admin/bulk-actions.tsx` — selection checkboxes + bulk action bar.
  - `frontend/src/components/admin/filters-panel.tsx` — advanced filters UI + saved presets.
  - `frontend/src/components/admin/submission-notes.tsx` — notes list + add note form.
- `frontend/src/lib/api.ts` or inline fetch helpers — add API functions for new endpoints.

## Steps for Modifications

### Phase 1: Backend Foundation
1. Add `SubmissionNote` model to Prisma schema.
2. Regenerate Prisma client / run `prisma db push` for development.
3. Add `/admin/overview` endpoint aggregating submissions/users/unread/today counts.
4. Extend `/admin/submissions` to accept query params: `from`, `to`, `status`, `service`, `type`, `search`.
5. Add bulk endpoints for read/unread, delete, status update.
6. Add notes endpoints (GET, POST, DELETE).

### Phase 2: Frontend Components
1. Create `OverviewTab` component with summary cards and recent submissions list.
2. Create `BulkActions` component — checkbox per row, select-all, action bar.
3. Create `FiltersPanel` component — date pickers, multi-select status, service/type toggles, saved presets.
4. Create `SubmissionNotes` component — display/add/delete notes.

### Phase 3: Integration
1. Update admin sidebar to include Overview tab.
2. Integrate OverviewTab into `admin/page.tsx`.
3. Integrate bulk selection and BulkActions bar into submissions table.
4. Replace existing simple filters with FiltersPanel and wire query params.
5. Add notes section to submission detail view (modal or expanded row).

### Phase 4: Polish & Review
1. Add loading skeletons and empty states for new sections.
2. Add toast notifications for bulk actions and note operations.
3. Run frontend code review checklist.
4. Run `bash rules/check.sh`.

## Potential Dependencies or Considerations

- **Prisma migration**: Adding `SubmissionNote` requires a schema migration. For local development, `prisma db push` is acceptable per project history.
- **Date inputs**: Use native `<input type="date">` or shadcn Calendar/DatePicker. To minimize dependencies, native date inputs are preferred.
- **Multi-select status**: Implement as a dropdown with checkboxes (using existing shadcn/ui components if available) or a simple set of toggle chips.
- **Saved filter presets**: Store in `localStorage` under a namespaced key.
- **Admin identity for notes**: The backend currently only knows the admin is authenticated; it does not store admin profiles. Notes will be attributed generically (e.g., "Admin") or by timestamp only. If desired, admin name can be added later.
- **Status stages**: Existing `STUDY_STAGES` and `SOURCING_STAGES` arrays should be reused for status filtering and bulk updates.

## Risk Handling

- **Backwards compatibility**: Existing submission endpoints remain unchanged; new query params are optional.
- **Data integrity**: Bulk delete uses Prisma transactions; attachments are deleted per existing logic.
- **Performance**: Overview endpoint uses `Promise.all` with `count()` queries (fast). Submissions list still limited to 100; filters applied at DB level.
- **Build errors**: After schema changes, regenerate Prisma client before starting backend. If file-lock errors occur, stop running backend first.
- **UI consistency**: New components will reuse the existing admin design tokens (slate/red/blue/amber, rounded-2xl, glass-card styles).
