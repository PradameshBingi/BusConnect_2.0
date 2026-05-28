{ pkgs, ... }: {
  # The list of extensions to be installed in the editor
  extensions = [
    "jnoortheen.nix-ide"
    "sumneko.lua"
    "denoland.vscode-deno"
  ];

  # The list of start-up tasks to be executed when the workspace is loaded.
  start-up = {
    # Install project dependencies
    dependencies = {
      # To automatically run `npm install` in the background
      # after the project is loaded
      npm-install = pkgs.nodejs_20.withPackages(p: [ p.npm ]);
    };

    # Start the development server and open a web preview
    start-server = {
      # The command to start the development server
      command = "npm run dev";
      # The web preview port
      port = 3000;
      # The action to be taken when the port is ready, e.g. open the preview
      on-ready = "open-preview";
    };
  };
}
