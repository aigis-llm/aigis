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
            in
            pkgs.mkShell {
              LD_LIBRARY_PATH = lib.makeLibraryPath (
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
              packages = [
                pkgs.nixfmt-rfc-style
                pkgs.python312
                pkgs.rye
                pkgs.bun
                pkgs.git
              ];
            };
        };
    };
}
