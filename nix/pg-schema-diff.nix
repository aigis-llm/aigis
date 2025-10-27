{
  perSystem =
    {
      pkgs,
      ...
    }:
    {
      packages.pg-schema-diff = pkgs.buildGoModule rec {
        name = "pg-schema-diff";
        doCheck = false;

        src = pkgs.fetchFromGitHub {
          owner = "stripe";
          repo = "pg-schema-diff";
          rev = "996618536f902975ad99357236b641cafeb53a31";
          hash = "sha256-vJBmAmKyyUNAiH1kUhfzrmlbfIydP4ijqxuDzkTfNik=";
        };

        vendorHash = "sha256-Hs3xrGP8eJwW3rQ9nViB9sqC8spjHV6rCoy1u/SYHak=";
      };
    };
}
