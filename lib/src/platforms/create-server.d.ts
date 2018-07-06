/// <reference types="node" />
import * as http from "http";
import { VoxaPlatform } from "./VoxaPlatform";
declare function createServer(skill: VoxaPlatform): http.Server;
export { createServer };
