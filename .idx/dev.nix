{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20 # nodejs
  ];

  # Sets environment variables in the workspace
  env = {};

  # Search for the starship package and use it as the shell prompt
  pre-start = {
    # Starship is a cross-platform shell prompt
    starship = pkgs.starship;
  };
}
