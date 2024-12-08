#!/usr/bin/env bash

mkdir -p vendor-node
mkdir -p vendor-node/@testing-library
rm -rf node_modules/css-tree/ vendor-node/css-tree
rm -rf node_modules/svelte/ vendor-node/svelte
rm -rf node_modules/@testing-library/svelte/ vendor-node/@testing-library/svelte
bun install
cp -r node_modules/css-tree/ vendor-node/
patch -p0 -d . -i css-tree-bun.patch
cp -r node_modules/svelte/ vendor-node/
patch -p0 -d . -i svelte-client.patch
cp -r node_modules/@testing-library/svelte/ vendor-node/@testing-library/svelte/
patch -p0 -d . -i testing-library-svelte.patch
# HORRIBLE HACK BECAUSE BUN DOES NOT SUPPORT NESTED DEPENDENCY OVERRIDES https://github.com/oven-sh/bun/issues/6608
rm -rf node_modules/css-tree
cp -r vendor-node/css-tree/ node_modules/
rm -rf node_modules/svelte
cp -r vendor-node/svelte/ node_modules/
rm -rf node_modules/@testing-library/svelte
cp -r vendor-node/@testing-library/svelte node_modules/@testing-library