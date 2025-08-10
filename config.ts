import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: "YOUR_CLIENT_ID", // Get this from tina.io
  token: "YOUR_TINA_TOKEN", // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "page",
        label: "Page",
        path: "backyard",
        fields: [
          {
            type: "html",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "insight",
        label: "Insight",
        path: "insights",
        fields: [
          {
            type: "html",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "news",
        label: "News",
        path: "news",
        fields: [
          {
            type: "html",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "root",
        label: "Root Pages",
        path: "/",
        fields: [
          {
            type: "html",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
