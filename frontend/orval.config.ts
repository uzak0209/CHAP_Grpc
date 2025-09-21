export default {
  auth: {
    input: '../docs/auth.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/auth.ts',
      schemas: './src/api/auth.schemas.ts',
    },
  },
  user: {
    input: '../docs/user.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/user.ts',
      schemas: './src/api/user.schemas.ts',
    },
  },
  post: {
    input: '../docs/post.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/post.ts',
      schemas: './src/api/post.schemas.ts',
    },
  },
  comment: {
    input: '../docs/comment.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/comment.ts',
      schemas: './src/api/comment.schemas.ts',
    },
  },
  thread: {
    input: '../docs/thread.swagger.json',
    output: {
      client: 'react-query',
      target: './src/api/thread.ts',
      schemas: './src/api/thread.schemas.ts',
    },
  },
}