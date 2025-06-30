{pkgs}: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
    pkgs.pnpm
    pkgs.jdk17
    pkgs.zip
  ];
  idx.extensions = [
    "GoogleCloudTools.firebase-dataconnect-vscode"
    "GraphQL.vscode-graphql-syntax"
  ];
  idx.workspace.onCreate = {
    extract-seed-data = "unzip seed-data.zip";
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