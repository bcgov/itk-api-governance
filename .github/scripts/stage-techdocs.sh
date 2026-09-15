#!/usr/bin/env bash
set -euo pipefail

# Run only in the disposable Actions checkout: the publisher requires one
# catalog and a MkDocs project at the workspace root.
case "${TECHDOCS_DIRECTORY:-}" in
  techdocs/api-style-guides|techdocs/sdx-api-standards) ;;
  *) echo "Unknown TechDocs project: ${TECHDOCS_DIRECTORY:-}" >&2; exit 1 ;;
esac

test -f "$TECHDOCS_DIRECTORY/catalog-info.yaml"
test -f "$TECHDOCS_DIRECTORY/mkdocs.yml"
test -d "$TECHDOCS_DIRECTORY/docs"

# Preserve any project-specific assets/configuration alongside docs and mkdocs.
cp -a "$TECHDOCS_DIRECTORY/." .

# The publishing action recursively finds catalogs but accepts only one.
find techdocs -type f \
  \( -name catalog-info.yaml -o -name catalog-info.yml \) -delete
