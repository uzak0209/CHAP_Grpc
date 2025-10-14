// Swagger UI に複数のドキュメントを渡す
window.onload = function() {
  const ui = SwaggerUIBundle({
    urls: [
      { url: "/docs/auth.swagger.json", name: "Auth" },
      { url: "/docs/user.swagger.json", name: "User" },
      { url: "/docs/comment.swagger.json", name: "Comment" },
      { url: "/docs/post.swagger.json", name: "Post" },
      { url: "/docs/thread.swagger.json", name: "Thread" },
      { url: "/docs/event.swagger.json", name: "Event" }
    ],
    dom_id: '#swagger-ui',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    layout: "StandaloneLayout"
  });

  window.ui = ui;
};