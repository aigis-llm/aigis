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
              packages = [
                pkgs.nixfmt-rfc-style
                pkgs.python312
                pkgs.rye
                pkgs.bun
              ];
            };
        };
    };
}
