{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    inputs@{
      nixpkgs,
      flake-parts,
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
              pythonldpath = lib.makeLibraryPath (
                with pkgs;
                [
                  zlib
                  zstd
                  stdenv.cc.cc.lib
                  curl
                  openssl
                  attr
                  libssh
                  bzip2
                  libxml2
                  acl
                  libsodium
                  util-linux
                  xz
                  systemd
                ]
              );
              wrapPrefix = if (!pkgs.stdenv.isDarwin) then "LD_LIBRARY_PATH" else "DYLD_LIBRARY_PATH";
              patchedPython = (
                pkgs.symlinkJoin {
                  name = "python-patched";
                  paths = [ pkgs.python313 ];
                  buildInputs = [ pkgs.makeWrapper ];
                  postBuild = ''
                    wrapProgram "$out/bin/python3.13" --prefix ${wrapPrefix} : "${pythonldpath}"
                  '';
                }
              );
            in
            pkgs.mkShell {
              packages = [
                pkgs.nixfmt-rfc-style
                patchedPython
                pkgs.rye
                pkgs.bun
                pkgs.just
                pkgs.supabase-cli
              ];
            };
        };
    };
}
