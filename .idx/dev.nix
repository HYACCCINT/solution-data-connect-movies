{pkgs}: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
    pkgs.pnpm
    pkgs.jdk17
  ];
  idx.extensions = [
    "GoogleCloudTools.firebase-dataconnect-vscode"
    "GraphQL.vscode-graphql-syntax"
  ];
  idx.workspace.onCreate = {
    install-dependencies = "pnpm install";
  };
  idx.workspace.onStart = {
    start-emulators = "npx -y firebase-tools@latest emulators:start";
  };
  idx.previews = {
    enable = true; 
    previews = {
      web = {
        command = [
          "pnpm"
          "run" 
          "dev" 
          "--port"
          "$PORT" 
        ];
        manager = "web";
      };
    };
  };
}