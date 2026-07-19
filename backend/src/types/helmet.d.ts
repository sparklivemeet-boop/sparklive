declare module 'helmet' {
  import { RequestHandler } from 'express';
  export default function helmet(): RequestHandler;
}