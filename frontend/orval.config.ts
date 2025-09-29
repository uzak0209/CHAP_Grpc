export default {
  auth: {
    input: '../docs/auth.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/auth.ts',
      schemas: './src/api/auth.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
  user: {
    input: '../docs/user.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/user.ts',
      schemas: './src/api/user.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
  post: {
    input: '../docs/post.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/post.ts',
      schemas: './src/api/post.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
  comment: {
    input: '../docs/comment.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/comment.ts',
      schemas: './src/api/comment.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
  thread: {
    input: '../docs/thread.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/thread.ts',
      schemas: './src/api/thread.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
    event: {
    input: '../docs/event.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/event.ts',
      schemas: './src/api/event.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
    spot: {
    input: '../docs/spot.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/spot.ts',
      schemas: './src/api/spot.schemas.ts',
      override: {
        host: 'http://localhost:8081',
      },
    },
  },
}