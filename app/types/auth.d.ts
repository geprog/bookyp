declare module '#auth-utils' {
  interface User {
    _id: string;
    email: string;
    name?: string;
  }
}

export {};
