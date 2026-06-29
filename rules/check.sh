#!/bin/bash

# 86 Connects - Code Quality Rules Check
# Based on PRD requirements for Next.js + Render + PostgreSQL stack

echo "=== Running ast-grep rules check ==="
echo ""

# Form and UI rules
ast-grep scan -r rules/selectitem.yml
ast-grep scan -r rules/contrast.yml
ast-grep scan -r rules/slot-nesting.yml
ast-grep scan -r rules/button-interactions.yml
ast-grep scan -r rules/form-validation.yml

# Next.js specific rules
ast-grep scan -r rules/use-client-directive.yml
ast-grep scan -r rules/require-next-image.yml

# SEO rules
ast-grep scan -r rules/seo-meta-tags.yml
ast-grep scan -r rules/seo-headings.yml
ast-grep scan -r rules/seo-images.yml

# Backend API rules (Express + Prisma)
ast-grep scan -r rules/api-form-submission.yml
ast-grep scan -r rules/no-oauth-sso.yml
ast-grep scan -r rules/express-body-parsing.yml

# Admin authentication rules
ast-grep scan -r rules/admin-route-protection.yml
ast-grep scan -r rules/toast-hook.yml

# useAuth / AuthProvider consistency check
useauth_output=$(ast-grep scan -r rules/useAuth.yml 2>/dev/null)

if [ -z "$useauth_output" ]; then
    exit 0
fi

authprovider_output=$(ast-grep scan -r rules/authProvider.yml 2>/dev/null)

if [ -n "$authprovider_output" ]; then
    exit 0
fi

echo "=== ast-grep scan -r rules/useAuth.yml output ==="
echo "$useauth_output"
echo ""
echo "=== ast-grep scan -r rules/authProvider.yml output ==="
echo "$authprovider_output"
echo ""
echo "⚠️  Issue detected:"
echo "The code uses useAuth Hook but does not have AuthProvider component wrapping the components."
echo "Please ensure that components using useAuth are wrapped with AuthProvider to provide proper authentication context."
echo ""
echo "Suggested fixes:"
echo "1. Add AuthProvider wrapper in app/layout.tsx (Next.js root layout)"
echo "2. Ensure all components using useAuth are within AuthProvider scope"