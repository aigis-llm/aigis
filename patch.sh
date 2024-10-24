#!/usr/bin/env bash

rm -rf node_modules/css-tree/ vendor-node/css-tree
bun install
cp -r node_modules/css-tree/ vendor-node/
patch -p0 -d . -i css-tree-bun.patch
# HORRIBLE HACK BECAUSE BUN DOES NOT SUPPORT NESTED DEPENDENCY OVERRIDES https://github.com/oven-sh/bun/issues/6608
rm -rf node_modules/css-tree
cp -r vendor-node/css-tree/ node_modules/