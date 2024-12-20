{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    flake-parts.url = "github:hercules-ci/flake-parts";

    pyproject-nix = {
      url = "github:pyproject-nix/pyproject.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    uv2nix = {
      url = "github:pyproject-nix/uv2nix";
      inputs.pyproject-nix.follows = "pyproject-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    pyproject-build-systems = {
      url = "github:pyproject-nix/build-system-pkgs";
      inputs.pyproject-nix.follows = "pyproject-nix";
      inputs.uv2nix.follows = "uv2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    uv2nix-hammer-overrides = {
      url = "github:TyberiusPrime/uv2nix_hammer_overrides";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      nixpkgs,
      flake-parts,
      uv2nix,
      pyproject-nix,
      pyproject-build-systems,
      uv2nix-hammer-overrides,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {

      systems = [
        "x86_64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];

      perSystem =
        {
          config,
          self',
          inputs',
          pkgs,
          system,
          lib,
          ...
        }:
        {
          devShells.default =
            let
              pkgs = import nixpkgs {
                inherit system;
              };
              workspace = uv2nix.lib.workspace.loadWorkspace { workspaceRoot = ./.; };
              overlay = workspace.mkPyprojectOverlay {
                sourcePreference = "wheel";
              };
              pyprojectOverrides = pkgs.lib.composeExtensions (uv2nix-hammer-overrides.overrides_strict pkgs) (
                _final: prev: {

                }
              );
              editableOverlay = workspace.mkEditablePyprojectOverlay {
                # Use environment variable
                root = "$REPO_ROOT";
              };
              python = pkgs.python313;
              pythonSet =
                # Use base package set from pyproject.nix builders
                (pkgs.callPackage pyproject-nix.build.packages {
                  inherit python;
                }).overrideScope
                  (
                    lib.composeManyExtensions [
                      pyproject-build-systems.overlays.default
                      overlay
                      pyprojectOverrides
                    ]
                  );

              editablePythonSet = pythonSet.overrideScope editableOverlay;

              # Build virtual environment, with local packages being editable.
              #
              # Enable all optional dependencies for development.
              virtualenv = editablePythonSet.mkVirtualEnv "aigis-dev-env" workspace.deps.all;

              bunLatest = pkgs.bun.overrideAttrs (
                final: prev:
                with pkgs;
                prev
                // rec {
                  version = "1.1.41";
                  src =
                    passthru.sources.${stdenvNoCC.hostPlatform.system}
                      or (throw "Unsupported system: ${stdenvNoCC.hostPlatform.system}");
                  passthru = prev.passthru // {
                    sources = prev.passthru.sources // {
                      "aarch64-darwin" = fetchurl {
                        url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-aarch64.zip";
                        sha256 = "sha256-ePPTdg34SWd5TV26HWYJFdw/gtEGSWLvHce8IJy8af4=";
                      };
                      "x86_64-darwin" = fetchurl {
                        url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-darwin-x64.zip";
                        sha256 = "sha256-ERVScu6RO7TCch4c/KrWdqerA45gz/NpfyQYcvLHOQQ=";
                      };
                      "x86_64-linux" = fetchurl {
                        url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64.zip";
                        sha256 = "sha256-KNq/ug2cLAN8AEOL3o12EpydaYJVp0TjusqGfW9UiBk=";
                      };
                    };
                  };
                }
              );
            in
            pkgs.mkShell {
              packages = [
                pkgs.nixfmt-rfc-style
                virtualenv
                pkgs.uv
                bunLatest
                pkgs.just
                pkgs.supabase-cli
              ];

              shellHook = ''
                # Undo dependency propagation by nixpkgs.
                unset PYTHONPATH
                # Get repository root using git. This is expanded at runtime by the editable `.pth` machinery.
                export REPO_ROOT=$(git rev-parse --show-toplevel)
                # Make uv use our Python.
                export UV_PYTHON=$(which python)
                # Stop uv from syncing
                export UV_NO_SYNC=1
                # Stop uv from downloading python
                export UV_PYTHON_DOWNLOADS=never
              '';
            };
        };
    };
}
